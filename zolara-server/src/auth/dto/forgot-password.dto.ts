import { IsString, Matches, IsOptional } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
