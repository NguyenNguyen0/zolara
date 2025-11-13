import { MediaType } from './base-message.dto';

export class ConversationUserDto {
  id: string;
  fullName?: string;
  profilePictureUrl?: string;
  statusMessage?: string;
  lastSeen?: Date;
}

export class GroupMemberDto {
  id: string;
  userId: string;
  fullName?: string;
  profilePictureUrl?: string;
  role?: string;
}

export class ConversationGroupDto {
  id: string;
  name: string;
  avatarUrl?: string;
  members?: GroupMemberDto[];
}

export class LastMessageDto {
  id: string;
  content: {
    text?: string;
    media?: {
      type: MediaType;
      url: string;
    }[];
  };
  senderId: string;
  senderName?: string;
  createdAt: Date;
  recalled: boolean;
  isRead: boolean;
}

export class ConversationItemDto {
  id: string;
  type: 'USER' | 'GROUP';
  user?: ConversationUserDto;
  group?: ConversationGroupDto;
  lastMessage?: LastMessageDto;
  unreadCount: number;
  updatedAt: Date;
}

export class ConversationListResponseDto {
  conversations: ConversationItemDto[];
  totalCount: number;
}
