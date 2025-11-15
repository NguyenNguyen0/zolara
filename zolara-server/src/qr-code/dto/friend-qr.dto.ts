import { IsNotEmpty, IsUUID } from 'class-validator';

export class ScanFriendQrDto {
  @IsNotEmpty()
  qrToken: string;
}

export class GenerateFriendQrDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
