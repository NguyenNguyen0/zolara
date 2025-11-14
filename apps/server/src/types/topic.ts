export interface TopicDocument {
	id: string;
	text: string;
	category: string;
	createdAt: Date;
	createdBy: string;
	updatedAt: Date;
	updatedBy: string;
}

export interface TopicCreateData {
	text: string;
	category: string;
	createdBy: string;
}

export interface GenerateTopicsRequest {
	count?: number; // 10-20, default 10
}

export interface GenerateTopicsResponse {
	message: string;
	generatedCount: number;
	totalCount: number;
}
