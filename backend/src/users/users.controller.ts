import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApproveUserDto } from './dto/approve-user.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =====================================================
  // CREATE USER
  // =====================================================

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // =====================================================
  // GET ALL USERS (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // =====================================================
  // CURRENT LOGGED-IN USER (MUST REMAIN ABOVE :id)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  // =====================================================
  // GET USER BY ID (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // =====================================================
  // APPROVE USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approveUser(
    @Param('id') id: string,
    @Body() dto: ApproveUserDto,
  ) {
    if (!dto.role) {
      throw new BadRequestException(
        'Role is required for user approval',
      );
    }

    return this.usersService.approveAndAssignUser(id, {
      role: dto.role,
      localId: dto.localId,
      phone: dto.phone,
    });
  }

  // =====================================================
  // UPDATE OWN PHONE NUMBER
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch('profile/phone')
  updatePhone(
    @Request() req: any,
    @Body() body: { phone: string },
  ) {
    return this.usersService.updatePhone(
      req.user.id,
      body.phone,
    );
  }

  // =====================================================
  // UPDATE USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  // =====================================================
  // REJECT USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.usersService.rejectUser(id);
  }

  // =====================================================
  // ACCEPT PREVIOUSLY REJECTED USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  accept(@Param('id') id: string) {
    return this.usersService.acceptUser(id);
  }

  // =====================================================
  // DISABLE USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return this.usersService.disableUser(id);
  }

  // =====================================================
  // ACTIVATE USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  // =====================================================
  // DELETE USER (PROTECTED)
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}