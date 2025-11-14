import { GoogleGenAI } from '@google/genai';
import { modelName, systemPrompt } from '../configs/agent';
import {
	convertHistoryToGeminiFormat,
	validateChatParams,
	setupSSEHeaders,
	writeSSEEvent,
} from '../utils/helpers/agent.helper';
import type {
	GeminiContent,
	AIConfig,
	ChatMessage,
	TopicsResponse,
} from '../types/agent';
import type { TopicCreateData, GenerateTopicsResponse } from '../types/topic';
import {
	createTopicDocuments,
	getAllTopics,
	getTopicsWithLimit,
	getTopicsCount,
	clearAllTopics,
} from './topic.service';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

// Common AI configuration with Google Search
const getDefaultAIConfig = (): AIConfig => ({
	systemInstruction: systemPrompt,
	tools: [{ googleSearch: {} }],
	maxOutputTokens: 1000,
	temperature: 0.7,
});

export const generateContent = async (
	contents: GeminiContent[] | string,
	customConfig: Partial<AIConfig> = {},
) => {
	return await ai.models.generateContent({
		model: modelName,
		contents: contents,
		config: {
			...getDefaultAIConfig(),
			...customConfig,
		},
	});
};

export const generateContentWithJsonSchema = async (
	contents: GeminiContent[] | string,
	schema: any,
	customConfig: Partial<AIConfig> = {},
) => {
	return await ai.models.generateContent({
		model: modelName,
		contents: contents,
		config: {
			responseMimeType: 'application/json',
			responseJsonSchema: schema
		},
	});
};

export const generateContentStream = async (
	contents: GeminiContent[] | string,
	customConfig: Partial<AIConfig> = {},
) => {
	return await ai.models.generateContentStream({
		model: modelName,
		contents: contents,
		config: {
			...getDefaultAIConfig(),
			...customConfig,
		},
	});
};

// High-level function for standard chat response
export const getChatResponse = async (
	userMessage: string,
	history?: string | ChatMessage[],
) => {
	const { userMessage: validUserMessage, history: validHistory } =
		validateChatParams(userMessage, history);
	const contents = convertHistoryToGeminiFormat(
		validHistory,
		validUserMessage,
	);

	const response = await generateContent(contents);

	return {
		userMessage: validUserMessage,
		response: response.text,
		timestamp: new Date().toISOString(),
		conversationLength: contents.length,
	};
};

// High-level function for streaming chat response
export const getChatStreamResponse = async (
	userMessage: string,
	history: string | ChatMessage[] | undefined,
	res: any,
) => {
	const { userMessage: validUserMessage, history: validHistory } =
		validateChatParams(userMessage, history);
	const contents = convertHistoryToGeminiFormat(
		validHistory,
		validUserMessage,
	);

	setupSSEHeaders(res);

	// Send initial connection event
	writeSSEEvent(res, {
		type: 'connected',
		message: 'Stream connected',
		userMessage: validUserMessage,
		conversationLength: contents.length,
		timestamp: new Date().toISOString(),
	});

	const responseStream = await generateContentStream(contents);
	let totalResponse = '';

	// Stream the response chunks
	for await (const chunk of responseStream) {
		if (chunk.text) {
			totalResponse += chunk.text;
			writeSSEEvent(res, {
				type: 'chunk',
				text: chunk.text,
				timestamp: new Date().toISOString(),
			});
			// Force flush after each chunk
			res.flush?.();
		}
	}

	// Ensure any final content is sent and send completion event
	writeSSEEvent(res, {
		type: 'complete',
		message: `Stream complete (${totalResponse.length} characters)`,
		text: '', // Any final content (usually empty since we stream all chunks)
		timestamp: new Date().toISOString(),
	});

	// Final flush before ending
	res.flush?.();

	res.end();
};

// High-level function to generate and store topics in Firestore
export const generateAndStoreTopics = async (
	count: number = 10,
	createdBy: string = 'system',
): Promise<GenerateTopicsResponse> => {
	// Validate count is within range
	const validatedCount = Math.min(Math.max(count, 10), 20);

	// First, search for current news
	const searchResponse = await generateContent(
		`Tổng hợp ${validatedCount} chủ đề nóng hổi, đang được quan tâm nhất hiện nay ở Việt Nam và thế giới.
		Ưu tiên các chủ đề về: thời sự, chiến sự, thiên tai, xu hướng mạng xã hội, công nghệ, chính trị, giải trí, thể thao.
		Mỗi chủ đề nên ngắn gọn (dưới 20 ký tự), gợi tò mò và dễ hiểu.`,
		{ tools: [{ googleSearch: {} }] },
	);

	// Format the results using JSON schema
	const TopicSchema = {
		type: 'object',
		properties: {
			topics: {
				type: 'array',
				description: 'Danh sách chủ đề trò chuyện',
				items: {
					type: 'object',
					properties: {
						text: { type: 'string', description: 'Nội dung chủ đề' },
						category: { type: 'string', description: 'Danh mục chủ đề' }
					},
					required: ['text', 'category']
				},
				minItems: 10,
				maxItems: 20,
			},
		},
		required: ['topics'],
	};

	const formatResponse = await generateContentWithJsonSchema(
		`Từ nội dung sau, hãy tạo danh sách ${validatedCount} chủ đề tin tức thật hấp dẫn,
		ví dụ như: {"text": "Chiến sự Ukraine", "category": "thời sự"}, {"text": "OpenAI Agents SDK", "category": "công nghệ"}.
		Tránh tiêu đề chung chung hoặc quá dài.
		Phân loại category phù hợp: "thời sự", "công nghệ", "giải trí", "thể thao", "chính trị", "kinh tế", "khoa học", "sức khỏe", "xã hội".
		Đầu ra chỉ gồm tên chủ đề ngắn, rõ, hấp dẫn, với category phù hợp, đúng định dạng JSON.
		Nội dung: ${searchResponse.text}`,
		TopicSchema,
	);

	const parsedResponse = JSON.parse(formatResponse.text as string);

	// Convert to TopicCreateData format
	const topicsToCreate: TopicCreateData[] = parsedResponse.topics.map((topic: any) => ({
		text: topic.text,
		category: topic.category,
		createdBy,
	}));

	// Clear existing topics and store new ones
	await clearAllTopics();
	await createTopicDocuments(topicsToCreate);

	// Get final count
	const totalCount = await getTopicsCount();

	return {
		message: 'Topics generated and stored successfully',
		generatedCount: topicsToCreate.length,
		totalCount,
	};
};

// High-level function to get topics from Firestore
export const getStoredTopics = async (count: number = 3): Promise<TopicsResponse> => {
	try {
		const topics = await getTopicsWithLimit(count);

		if (topics.length === 0) {
			// Return fallback topics if collection is empty
			const fallbackTopics = [
				'Tình hình chiến sự Ukraine',
				'Tranh luận về quy định AI trên toàn cầu',
				'Kết quả hội nghị biến đổi khí hậu',
				'Phát triển công nghệ AI trong năm 2025',
				'Tình hình kinh tế thế giới hiện tại',
			].slice(0, count);

			return {
				topics: fallbackTopics,
				fallback: true,
			};
		}

		return {
			topics: topics.map(topic => topic.text),
			fallback: false,
		};
	} catch (error) {
		console.error('Error getting stored topics:', error);

		// Return fallback on error
		const fallbackTopics = [
			'Tình hình chiến sự Ukraine',
			'Tranh luận về quy định AI trên toàn cầu',
			'Kết quả hội nghị biến đổi khí hậu',
			'Phát triển công nghệ AI trong năm 2025',
			'Tình hình kinh tế thế giới hiện tại',
		].slice(0, count);

		return {
			topics: fallbackTopics,
			fallback: true,
		};
	}
};
