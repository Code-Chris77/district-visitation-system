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

  // ➕ POST /visits - Record a new visitation log
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    return this.visitationsService.create({
      ...body,
      pastorId: req.user?.id || body.pastorId, // Automatically attaches logged-in Pastor
    });
  }

  // 📜 GET /visits/reports - Formatted timeline and historical observations
  @UseGuards(JwtAuthGuard)
  @Get('reports')
  async getReports() {
    return this.visitationsService.getVisitationReports();
  }

  // 📋 GET /visits - Queue list
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.visitationsService.findAll();
  }

  // ✏️ PATCH /visits/:id - Update status or notes
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.visitationsService.update(id, body);
  }
}
