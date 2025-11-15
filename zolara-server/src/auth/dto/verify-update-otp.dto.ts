import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyUpdateOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @IsString()
  @IsNotEmpty()
  updateId: string;
}
