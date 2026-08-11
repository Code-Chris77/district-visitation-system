import { Module } from "@nestjs/common";
import { LocalsController } from "./locals.controller";
import { LocalsService } from "./locals.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [LocalsController],
  providers: [LocalsService],
})
export class LocalsModule {}
