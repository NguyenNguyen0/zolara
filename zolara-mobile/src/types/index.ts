// Common interfaces used across the application

export interface User {
  userId: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  userInfo: UserInfo;
  relationship: {
    status: string;
    message: string;
    friendshipId: string;
  };
}

export interface UserInfo {
  id: string;
  fullName?: string;
  userId: string;
  bio?: string;
  profilePictureUrl?: string;
  coverImgUrl?: string;
  phoneNumber?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  user: User;
  friend: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatItemData {
  friendshipId: string;
  friend: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: {
      fullName: string;
      profilePictureUrl: string;
      statusMessage: string;
      lastSeen: string;
    };
  };
  since: string;
}

export interface UserSetting {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  privacyLevel: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  name?: string;
  loading?: boolean;
  width?: number;
  height?: number;
}

export interface UpdateBasicInfoData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface MessageMedia {
  url: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  fileId?: string;
  fileName?: string;
  thumbnailUrl?: string;
  metadata?: {
    path: string;
    size: number;
    mimeType: string;
    extension: string;
    bucketName: string;
    uploadedAt: string;
    sizeFormatted: string;
  };
}

export interface MessageReaction {
  count?: number;
  userId: string;
  reaction: ReactionType;
}

export interface Message {
  id: string;
  content: {
    text?: string;
    image?: string;
    video?: string;
    media?: MessageMedia[];
  };
  senderId: string;
  receiverId: string;
  groupId?: string;
  recalled?: boolean;
  deletedBy?: string[];
  repliedTo?: string | null;
  reactions?: MessageReaction[];
  readBy?: string[];
  createdAt?: string;
  updatedAt?: string;
  messageType: "USER" | "GROUP";
  forwardedFrom?: string | null;
  isMe?: boolean;
}

export interface SendMessageRequest {
  receiverId: string;
  content: {
    text?: string;
  };
}

export interface SendGroupMessageRequest {
  groupId: string;
  content: {
    text?: string;
  };
}

export interface SendMediaMessageRequest {
  receiverId: string;
  text?: string;
  files: MediaUploadFile[];
}

export interface MediaUploadFile {
  uri: string;
  type: string;
  name?: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
}

// Conversation interfaces
export interface Conversation {
  id: string;
  type: "USER" | "GROUP";
  unreadCount: number;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  group?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    id: string;
    content: {
      text?: string;
      media?: MessageMedia[];
    };
    recalled?: boolean;
    senderId: string;
    createdAt: string;
  };
}

export interface ConversationListProps {
  conversations: Conversation[];
  onConversationPress: (conversation: Conversation) => void;
}

// Group related interfaces
export interface Group {
  id: string;
  name: string;
  creatorId: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
}

export interface GroupInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  memberCount?: number;
}

export interface GroupMember {
  user?: UserInfo;
  id: string;
  groupId: string;
  userId: string;
  role: "LEADER" | "CO_LEADER" | "MEMBER";
  fullName?: string;
  profilePictureUrl?: string;
  addedBy?: {
    id: string;
    fullName: string;
  };
}
