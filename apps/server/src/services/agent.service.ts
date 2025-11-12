import { GoogleGenAI } from '@google/genai';
import { modelName, systemPrompt } from '../configs/agent';
import type {
	ChatMessage,
	GeminiContent,
	SSEEvent,
	AIConfig,
} from '../types/agent';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to convert conversation history to Gemini format
export const convertHistoryToGeminiFormat = (
	history: ChatMessage[] | undefined,
	userMessage: string,
): GeminiContent[] => {
	const contents = [];

	// Add conversation history
	if (history && Array.isArray(history)) {
		for (const msg of history) {
			contents.push({
				role: msg.role === 'assistant' ? 'model' : 'user',
				parts: [{ text: msg.content }],
			});
		}
	}

	// Add the new user message
	contents.push({
		role: 'user',
		parts: [{ text: userMessage }],
	});

	return contents;
};

// Helper function to validate and parse chat parameters
export const validateChatParams = (
	userMessage: string,
	history?: string | ChatMessage[],
) => {
	if (!userMessage) {
		throw new Error('Missing userMessage parameter');
	}

	let parsedHistory = history;
	if (typeof history === 'string') {
		try {
			parsedHistory = JSON.parse(history);
		} catch (parseError) {
			throw new Error(
				'Invalid history format. Must be valid JSON array.',
			);
		}
	}

	return { userMessage, history: parsedHistory };
};

// Common AI configuration with Google Search
const getDefaultAIConfig = (): AIConfig => ({
	systemInstruction: systemPrompt,
	tools: [{ googleSearch: {} }],
	maxOutputTokens: 1000,
	temperature: 0.7,
});

// Helper function to set up SSE headers
export const setupSSEHeaders = (res: any) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Access-Control-Allow-Origin', '*');
};

// Helper function to write SSE events
export const writeSSEEvent = (res: any, data: SSEEvent) => {
	res.write(`data: ${JSON.stringify(data)}\n\n`);
};

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

	// Stream the response chunks
	for await (const chunk of responseStream) {
		if (chunk.text) {
			writeSSEEvent(res, {
				type: 'chunk',
				text: chunk.text,
				timestamp: new Date().toISOString(),
			});
		}
	}

	// Send completion event
	writeSSEEvent(res, {
		type: 'complete',
		message: 'Stream complete',
		timestamp: new Date().toISOString(),
	});

	res.end();
};
