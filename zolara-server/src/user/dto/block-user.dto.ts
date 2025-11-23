import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class BlockUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsDateString()
  blockUntil?: string; // ISO date string for when the block expires. If not provided, block is permanent until manually unblocked
}

export class UnblockUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}