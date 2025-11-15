import { MediaType } from '../dtos/base-message.dto';
import { JsonValue } from './prisma-json.interface';

/**
 * Interface for media item metadata
 */
export interface MediaItemMetadata {
  size?: number;
  sizeFormatted?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  extension?: string;
  uploadedAt?: string;
  path?: string;
  bucketName?: string;
}

/**
 * Interface for media item in a message
 */
export interface MediaItem {
  url: string;
  type: MediaType | string;
  fileId?: string;
  fileName?: string;
  thumbnailUrl?: string;
  metadata?: MediaItemMetadata;
}

/**
 * Interface for message content
 */
export interface MessageContent {
  text?: string;
  media?: MediaItem[];
}

/**
 * Interface for message from Prisma
 */
export interface PrismaMessage {
  id: string;
  content: JsonValue; // Using JsonValue for Prisma JSON type
  senderId: string;
  receiverId?: string;
  groupId?: string;
  recalled: boolean;
  deletedBy: string[];
  repliedTo?: string;
  reactions: JsonValue[]; // Using JsonValue for Prisma JSON array
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
  messageType?: 'USER' | 'GROUP';
}
