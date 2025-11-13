import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DeviceType } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  @ValidateIf((o) => !o.phoneNumber)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  email?: string;

  @IsString()
  @ValidateIf((o) => !o.email)
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsEnum(DeviceType)
  deviceType: DeviceType;
}
