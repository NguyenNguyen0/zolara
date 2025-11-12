export enum ConversationType {
	DIRECT = 'direct',
	GROUP = 'group',
}

export interface Participant {
	userId: string;
	joinedAt: Date;
}

export interface GroupInfo {
	name: string;
	avatarUrl?: string;
	createdBy: string;
}

export interface LastMessage {
	id: string;
	content?: string;
	senderId: string;
	createdAt: Date;
}

export interface Conversation {
	id: string;
	type: ConversationType;
	participants: Participant[];
	group?: GroupInfo;
	lastMessageAt?: Date;
	seenBy: string[]; // Array of user IDs who have seen the last message
	lastMessage?: LastMessage | null;
	unreadCounts: Map<string, number>; // Map of userId -> unread count
	createdAt: Date;
	updatedAt?: Date;
}

export interface ConversationDocument {
	type: ConversationType;
	participants: Participant[];
	group?: GroupInfo;
	lastMessageAt?: Date;
	seenBy: string[];
	lastMessage?: LastMessage | null;
	unreadCounts: { [userId: string]: number };
	createdAt: Date;
	updatedAt?: Date;
}

export interface ConversationCreateData {
	type: ConversationType;
	participantIds: string[]; // User IDs
	groupName?: string; // Required for group conversations
	groupAvatarUrl?: string;
	createdBy: string; // User ID who created the conversation
}

export interface ConversationUpdateData {
	groupName?: string;
	groupAvatarUrl?: string;
}

export interface ConversationResponse extends Conversation {
	participantDetails?: any[]; // Populated user data
}
