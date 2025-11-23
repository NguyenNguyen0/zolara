import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckUserStatusDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
