import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.member.create({
      data,
      include: {
        local: true,
      },
    });
  }

  findAll() {
    return this.prisma.member.findMany({
      include: {
        local: true,
        visits: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });
  }

  findOne(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        local: true,
        visits: true,
      },
    });
  }

  update(id: string, data: any) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.member.delete({
      where: { id },
    });
  }
}
