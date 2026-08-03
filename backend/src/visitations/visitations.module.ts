import { Module } from '@nestjs/common';
import { VisitationsController } from './visitations.controller';
import { VisitationsService } from './visitations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VisitationsController],
  providers: [VisitationsService],
  exports: [VisitationsService],
})
export class VisitationsModule {}
