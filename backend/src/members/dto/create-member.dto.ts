import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string; // Required string

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsString()
  @IsNotEmpty()
  localId: string;
}