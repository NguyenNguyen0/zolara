export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	content?: string; // Text content (optional if image is present)
	imgUrl?: string; // Image URL
	createdAt: Date;
	updatedAt?: Date;
}

export interface MessageDocument {
	conversationId: string;
	senderId: string;
	content?: string;
	imgUrl?: string;
	createdAt: Date;
	updatedAt?: Date;
}

export interface MessageCreateData {
	conversationId: string;
	senderId: string;
	content?: string;
	imgUrl?: string;
}

export interface MessageUpdateData {
	content?: string;
	imgUrl?: string;
}

export interface MessageResponse extends Message {
	sender?: any; // Populated user data
}

export interface MessagesQueryParams {
	conversationId: string;
	limit?: number;
	before?: Date; // For pagination - get messages before this timestamp
	after?: Date; // For real-time updates - get messages after this timestamp
}
