import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitationsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a new Pastoral Visitation Plan
  async createVisitationPlan(
    pastorId: string,
    data: { localId: string; title?: string; durationDays: number; startDate: string },
  ) {
    // Archive previous active plans for this pastor
    await this.prisma.visitationPlan.updateMany({
      where: { pastorId, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' },
    });

    const start = new Date(data.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + data.durationDays);

    const local = await this.prisma.local.findUnique({ where: { id: data.localId } });
    if (!local) throw new NotFoundException('Local Assembly not found.');

    const members = await this.prisma.member.findMany({
      where: { localId: data.localId },
      orderBy: { firstName: 'asc' },
    });

    if (members.length === 0) {
      throw new BadRequestException('No registered members in this assembly to schedule.');
    }

    return this.prisma.visitationPlan.create({
      data: {
        pastorId,
        localId: data.localId,
        title: data.title || `${local.name} Pastoral Plan`,
        startDate: start,
        endDate: end,
        status: 'ACTIVE',
        planMembers: {
          create: members.map((m, index) => ({
            memberId: m.id,
            status: 'PENDING',
            order: index + 1,
          })),
        },
      },
      include: {
        local: true,
        planMembers: { include: { member: true } },
      },
    });
  }

  // 2. Fetch Active Plan
  async getActivePlan(pastorId: string) {
    return this.prisma.visitationPlan.findFirst({
      where: { pastorId, status: 'ACTIVE' },
      include: {
        local: true,
        planMembers: {
          include: { member: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  // 3. Complete Plan Visit (Guarantees Visit Table Record Insertion)
  async completePlanVisit(planMemberId: string, pastorId: string, notes?: string) {
    const planMember = await this.prisma.planMember.findFirst({
      where: {
        id: planMemberId,
        plan: { pastorId },
      },
      include: { plan: true },
    });

    if (!planMember) {
      throw new UnauthorizedException(
        'You do not have permission to modify this visitation record.',
      );
    }

    if (planMember.status === 'VISITED') {
      throw new BadRequestException('This member visit has already been recorded.');
    }

    const now = new Date();
    const visitNotes = notes?.trim() || 'Pastoral residence visit completed.';

    // 🎯 CRITICAL FIX: Explicitly create row in Visit table so History & Reports pick it up
    const [visitRecord, updatedPlanMember] = await this.prisma.$transaction([
      this.prisma.visit.create({
        data: {
          memberId: planMember.memberId,
          pastorId,
          notes: visitNotes,
          visitDate: now,
        },
      }),
      this.prisma.planMember.update({
        where: { id: planMemberId },
        data: {
          status: 'VISITED',
          visitedAt: now,
          notes: visitNotes,
        },
      }),
    ]);

    // Check if plan is 100% finished
    const remainingCount = await this.prisma.planMember.count({
      where: { planId: planMember.planId, status: 'PENDING' },
    });

    if (remainingCount === 0) {
      await this.prisma.visitationPlan.update({
        where: { id: planMember.planId },
        data: { status: 'COMPLETED' },
      });
    }

    return { visitRecord, updatedPlanMember };
  }

  // 4. Fetch Reports Data (Directly aggregates Visit table for History Popups & Reports Page)
  async getVisitationReports() {
    const members = await this.prisma.member.findMany({
      include: {
        local: true,
        visits: {
          include: {
            pastor: true,
          },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    return members.map((m) => {
      const lastVisit = m.visits.length > 0 ? m.visits[0].visitDate : null;
      return {
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        local: m.local,
        lastVisitDate: lastVisit,
        visitCount: m.visits.length,
        notes: m.visits.map((v) => ({
          id: v.id,
          visitDate: v.visitDate,
          notes: v.notes || 'Pastoral residence visit completed.',
          pastor: v.pastor
            ? { firstName: v.pastor.firstName, lastName: v.pastor.lastName }
            : null,
        })),
      };
    });
  }

  // 5. Fetch Plan History
  async getPlanHistory(pastorId: string) {
    return this.prisma.visitationPlan.findMany({
      where: { pastorId, status: { in: ['COMPLETED', 'ARCHIVED'] } },
      include: {
        local: true,
        planMembers: { include: { member: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
