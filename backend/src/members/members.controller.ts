import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';

import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
  ) {}

  @Post()
  create(
    @Body() createMemberDto: CreateMemberDto,
  ) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.membersService.findAll(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.membersService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Request() req: any,
  ) {
    return this.membersService.update(
      id,
      updateMemberDto,
      req.user,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.membersService.remove(id);
  }
}