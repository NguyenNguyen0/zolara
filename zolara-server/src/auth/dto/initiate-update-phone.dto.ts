import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class InitiateUpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  newPhoneNumber: string;
}
