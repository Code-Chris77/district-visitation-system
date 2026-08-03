import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LocalsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const locals = await this.prisma.local.findMany({
      orderBy: {
        name: "asc",
      },

      include: {
        members: true,

        users: {
          where: {
            role: "ELDER",
            isActive: true,
          },
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return locals.map((local) => ({
      id: local.id,
      name: local.name,
      code: local.code,

      leaderName:
        local.users.length > 0
          ? `${local.users[0].firstName} ${local.users[0].lastName}`
          : null,

      leaderPhone:
        local.users.length > 0
          ? local.users[0].phone
          : null,

      members: local.members,
    }));
  }
}