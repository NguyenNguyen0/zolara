import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyForgotPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  resetId: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
