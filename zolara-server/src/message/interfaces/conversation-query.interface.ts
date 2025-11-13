/**
 * Interface for direct conversation query result
 */
export interface DirectConversationQueryResult {
  id: string;
  type: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  statusMessage: string | null;
  lastSeen: Date | null;
  lastMessageId: string | null;
  lastMessageContent: any | null;
  lastMessageSenderId: string | null;
  lastMessageCreatedAt: Date | null;
  lastMessageRecalled: boolean | null;
  isLastMessageRead: boolean | null;
  unreadCount: string | number;
  updatedAt: Date | null;
}

/**
 * Interface for group conversation query result
 */
export interface GroupConversationQueryResult {
  id: string;
  type: string;
  name: string;
  avatarUrl: string | null;
  lastMessageId: string | null;
  lastMessageContent: any | null;
  lastMessageSenderId: string | null;
  lastMessageCreatedAt: Date | null;
  lastMessageRecalled: boolean | null;
  isLastMessageRead: boolean | null;
  unreadCount: string | number;
  updatedAt: Date | null;
}
