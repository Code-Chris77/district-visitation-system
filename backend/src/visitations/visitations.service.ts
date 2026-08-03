import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================
  // 📜 HISTORICAL TIMELINE REPORTS
  // ==========================================================
  async getVisitationReports() {
    const membersWithVisits = await this.prisma.member.findMany({
      where: {
        visits: {
          some: {}, // Only members with at least 1 visit record
        },
      },
      include: {
        visits: {
          orderBy: {
            visitDate: 'desc', // Chronological timeline (Newest first)
          },
          include: {
            pastor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return membersWithVisits.map((member) => {
      const visits = member.visits || [];
      const visitCount = visits.length;

      const lastVisitDate = visits[0]?.visitDate || null;
      const firstVisitDate = visits[visitCount - 1]?.visitDate || null;

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        location: member.landmark || 'Location pending',
        latitude: member.latitude,
        longitude: member.longitude,
        visitCount,
        firstVisitDate,
        lastVisitDate,
        notes: visits.map((v) => ({
          id: v.id,
          visitDate: v.visitDate,
          notes: v.notes,
          pastor: v.pastor
            ? {
                firstName: v.pastor.firstName,
                lastName: v.pastor.lastName,
              }
            : null,
        })),
      };
    });
  }

  // ==========================================================
  // 📋 GET ALL VISITS QUEUE
  // ==========================================================
  async findAll() {
    return this.prisma.visit.findMany({
      include: {
        member: true,
        pastor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        visitDate: 'desc',
      },
    });
  }

  // ==========================================================
  // ➕ CREATE NEW VISITATION LOG
  // ==========================================================
  async create(data: {
    memberId: string;
    notes?: string;
    pastorId?: string;
    visitDate?: Date | string;
  }) {
    const targetPastorId = data.pastorId || (data as any).userId;

    if (!targetPastorId) {
      throw new BadRequestException('Pastor ID is required to record a visit.');
    }

    return this.prisma.visit.create({
      data: {
        memberId: data.memberId,
        pastorId: targetPastorId,
        notes: data.notes ?? null,
        visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
      },
      include: {
        member: true,
        pastor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // ✏️ UPDATE VISIT STATUS/NOTES
  // ==========================================================
  async update(id: string, data: any) {
    const existing = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Visitation record not found');
    }

    return this.prisma.visit.update({
      where: { id },
      data,
      include: {
        member: true,
        pastor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}