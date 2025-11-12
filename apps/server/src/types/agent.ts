export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatResponse {
	userMessage: string;
	response: string;
	timestamp: string;
	conversationLength: number;
}

export interface TopicsResponse {
	topics: string[];
	fallback?: boolean;
}

export interface GeminiContent {
	role: 'user' | 'model';
	parts: Array<{ text: string }>;
}

export interface SSEEvent {
	type: 'connected' | 'chunk' | 'complete' | 'error';
	text?: string;
	message?: string;
	error?: string;
	userMessage?: string;
	conversationLength?: number;
	timestamp: string;
}

export interface AIConfig {
	systemInstruction?: string;
	tools?: Array<{ googleSearch: Record<string, unknown> }>;
	maxOutputTokens?: number;
	temperature?: number;
	responseMimeType?: string;
	responseJsonSchema?: unknown;
}
