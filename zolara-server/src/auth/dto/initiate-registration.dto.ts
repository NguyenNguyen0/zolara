import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class InitiateRegistrationDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
