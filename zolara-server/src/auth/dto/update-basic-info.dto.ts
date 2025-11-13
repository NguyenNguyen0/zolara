import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from '@prisma/client';

export class UpdateBasicInfoDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Ensure the date is in ISO format with time
    const date = new Date(value);
    return date.toISOString();
  })
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  bio?: string;
}
