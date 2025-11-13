import { IsNotEmpty, IsUUID } from 'class-validator';

export class InitialMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  addedById: string;
}
