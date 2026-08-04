import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VisitationsService } from './visitations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visits')
export class VisitationsController {
  constructor(private readonly visitationsService: VisitationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('plan')
  async createPlan(
    @Request() req: any,
    @Body() body: { localId: string; title?: string; durationDays: number; startDate: string },
  ) {
    const pastorId = req.user?.id || req.user?.sub;
    return this.visitationsService.createVisitationPlan(pastorId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plan/active')
  async getActivePlan(@Request() req: any) {
    const pastorId = req.user?.id || req.user?.sub;
    return this.visitationsService.getActivePlan(pastorId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('plan/member/:planMemberId/complete')
  async completePlanVisit(
    @Param('planMemberId') planMemberId: string,
    @Request() req: any,
    @Body('notes') notes?: string,
  ) {
    const pastorId = req.user?.id || req.user?.sub;
    return this.visitationsService.completePlanVisit(planMemberId, pastorId, notes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports')
  async getReports() {
    return this.visitationsService.getVisitationReports();
  }

  @UseGuards(JwtAuthGuard)
  @Get('plan/history')
  async getPlanHistory(@Request() req: any) {
    const pastorId = req.user?.id || req.user?.sub;
    return this.visitationsService.getPlanHistory(pastorId);
  }
}
