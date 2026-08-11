import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================
  // SHARED PRISMA INCLUDE CONFIGURATION
  // ==========================================================

  private readonly userInclude = {
    local: true,
  };

  // ==========================================================
  // BASIC CRUD
  // ==========================================================

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
      include: this.userInclude,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: this.userInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: this.userInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data,
      include: this.userInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      include: this.userInclude,
    });
  }

  // ==========================================================
  // LOOKUPS & PROFILE UPDATES
  // ==========================================================

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: this.userInclude,
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: {
        googleId,
      },
      include: this.userInclude,
    });
  }

  async updatePhone(userId: string, phone: string) {
    await this.findOne(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone,
      },
      include: this.userInclude,
    });
  }

  // ==========================================================
  // GOOGLE AUTHENTICATION (EXPLICIT UNASSIGNED ROLE)
  // ==========================================================

  async createGoogleUser(data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }) {
    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
        role: UserRole.UNASSIGNED, // 👈 Explicit assignment
        status: UserStatus.PENDING,
        isActive: true,
        lastLogin: new Date(),
      },
      include: this.userInclude,
    });
  }

  async updateGoogleLogin(
    id: string,
    data: {
      googleId?: string;
      firstName?: string;
      lastName?: string;
      picture?: string;
    },
  ) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        googleId: data.googleId,
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
        lastLogin: new Date(),
      },
      include: this.userInclude,
    });
  }

  // ==========================================================
  // STATUS QUERIES
  // ==========================================================

  async getUsersByStatus(status: UserStatus) {
    return this.prisma.user.findMany({
      where: {
        status,
      },
      include: this.userInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPendingUsers() {
    return this.getUsersByStatus(UserStatus.PENDING);
  }

  async getApprovedUsers() {
    return this.getUsersByStatus(UserStatus.APPROVED);
  }

  async getRejectedUsers() {
    return this.getUsersByStatus(UserStatus.REJECTED);
  }

  // ==========================================================
  // ADMIN APPROVAL WORKFLOW & ACTIONS
  // ==========================================================

  async approveAndAssignUser(
    userId: string,
    dto: {
      role: UserRole;
      localId?: string | null;
      phone?: string;
    },
  ) {
    const user = await this.findOne(userId);

    const targetLocalId = dto.localId ? dto.localId : null;

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.APPROVED,
        role: dto.role,
        localId: targetLocalId,
        phone: dto.phone ?? user.phone,
        isActive: true,
      },
      include: this.userInclude,
    });
  }

  async rejectUser(userId: string) {
    await this.findOne(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.REJECTED,
        isActive: false,
      },
      include: this.userInclude,
    });
  }

  async acceptUser(userId: string) {
    await this.findOne(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.APPROVED,
        isActive: true,
      },
      include: this.userInclude,
    });
  }

  async disableUser(userId: string) {
    return this.rejectUser(userId);
  }

  async activateUser(userId: string) {
    return this.acceptUser(userId);
  }

  // ==========================================================
  // DASHBOARD COUNTS
  // ==========================================================

  async getUserStatistics() {
    const [
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          status: UserStatus.PENDING,
        },
      }),
      this.prisma.user.count({
        where: {
          status: UserStatus.APPROVED,
        },
      }),
      this.prisma.user.count({
        where: {
          status: UserStatus.REJECTED,
        },
      }),
      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      activeUsers,
    };
  }
}