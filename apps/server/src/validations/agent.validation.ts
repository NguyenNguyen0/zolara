import { z } from 'zod';

// Schema for chat message
export const ChatMessageSchema = z.object({
	role: z.enum(['user', 'assistant']),
	content: z.string().min(1, 'Content cannot be empty'),
});

// Schema for chat history
export const ChatHistorySchema = z.array(ChatMessageSchema).optional();

// Schema for chat request query parameters
export const ChatRequestSchema = z.object({
	userMessage: z.string().min(1, 'User message is required'),
	message: z.string().min(1, 'Message is required').optional(),
	history: z.union([z.string(), ChatHistorySchema]).optional(),
});

// Schema for topics request query parameters (GET)
export const TopicsRequestSchema = z.object({
	count: z.coerce.number().int().min(1).max(10).default(3),
	topic: z.string().default('tin tức, drama'),
});

// Schema for generate topics request (POST)
export const GenerateTopicsRequestSchema = z.object({
	count: z.coerce.number().int().min(10).max(20).default(10),
});

// Schema for topics response
export const TopicsResponseSchema = z.object({
	topics: z
		.array(z.string())
		.min(1)
		.max(10)
		.describe('Danh sách chủ đề trò chuyện'),
	fallback: z.boolean().optional(),
});

// Schema for generate topics response
export const GenerateTopicsResponseSchema = z.object({
	message: z.string(),
	generatedCount: z.number(),
	totalCount: z.number(),
});

// Schema for validating Gemini content format
export const GeminiContentSchema = z.object({
	role: z.enum(['user', 'model']),
	parts: z.array(z.object({ text: z.string() })),
});

// Schema for SSE event data
export const SSEEventSchema = z.object({
	type: z.enum(['connected', 'chunk', 'complete', 'error']),
	text: z.string().optional(),
	message: z.string().optional(),
	error: z.string().optional(),
	userMessage: z.string().optional(),
	conversationLength: z.number().optional(),
	timestamp: z.string(),
});
