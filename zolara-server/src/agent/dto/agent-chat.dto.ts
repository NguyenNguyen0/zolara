import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageHistoryDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how can you help me?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Timestamp of the message',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class AgentChatDto {
  @ApiProperty({
    description: 'Current user message',
    example: 'Can you help me understand how to use this application?',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Chat history for context',
    type: [MessageHistoryDto],
    required: false,
    example: [
      {
        role: 'user',
        content: 'Hello',
        timestamp: '2024-01-01T00:00:00Z',
      },
      {
        role: 'assistant',
        content: 'Hi! How can I help you?',
        timestamp: '2024-01-01T00:00:05Z',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageHistoryDto)
  history?: MessageHistoryDto[];

  @ApiProperty({
    description: 'Session ID for tracking conversation',
    required: false,
    example: 'session_123456',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
