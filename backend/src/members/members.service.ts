import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { User } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================================
  // CREATE MEMBER
  // ==========================================================

  async create(data: CreateMemberDto) {
    return this.prisma.member.create({
      data,
    });
  }

  // ==========================================================
  // GET MEMBERS
  // ==========================================================

  async findAll(user?: Partial<User>) {
    // Admins & Pastors see all members
    if (!user || user.role === 'ADMIN' || user.role === 'PASTOR') {
      return this.prisma.member.findMany({
        include: {
          local: true,
          visits: {
            include: {
              pastor: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Data Officers, Elders & Deacons see only their local
    if (!user.localId) {
      return [];
    }

    return this.prisma.member.findMany({
      where: {
        localId: user.localId,
      },
      include: {
        local: true,
        visits: {
          include: {
            pastor: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ==========================================================
  // GET SINGLE MEMBER
  // ==========================================================

  async findOne(
    id: string,
    user?: any,
  ) {
    const member = await this.prisma.member.findUnique({
      where: {
        id,
      },
      include: {
        local: true,
      },
    });

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    // Security check
    if (
      user &&
      user.role !== 'ADMIN' &&
      user.role !== 'PASTOR'
    ) {
      const userLocalId =
        user.localId || user.local?.id;

      if (
        userLocalId &&
        member.localId !== userLocalId
      ) {
        throw new ForbiddenException(
          'Access denied: You cannot access members outside your assigned local assembly.',
        );
      }
    }

    return member;
  }

  // ==========================================================
  // UPDATE MEMBER
  // ==========================================================

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
    user?: any,
  ) {
    // Verify permission first
    await this.findOne(id, user);

    return this.prisma.member.update({
      where: {
        id,
      },
      data: {
        firstName: updateMemberDto.firstName,
        lastName: updateMemberDto.lastName,
        phone: updateMemberDto.phone,
        gender: updateMemberDto.gender,
        landmark: updateMemberDto.landmark,

latitude: updateMemberDto.latitude,

longitude: updateMemberDto.longitude,

accuracy: updateMemberDto.accuracy,
      },
    });
  }

  // ==========================================================
  // DELETE MEMBER
  // ==========================================================

  async remove(id: string) {
    return this.prisma.member.delete({
      where: {
        id,
      },
    });
  }
}