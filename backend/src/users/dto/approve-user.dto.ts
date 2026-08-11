import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class ApproveUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  localId?: string | null;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
