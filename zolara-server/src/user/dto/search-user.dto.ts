import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchUserDto {
  @IsEmail()
  @ValidateIf((o) => !o.phoneNumber)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsOptional()
  email?: string;

  @IsString()
  @ValidateIf((o) => !o.email)
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  @IsOptional()
  phoneNumber?: string;
}
