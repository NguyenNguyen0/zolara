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
} from '../types/agent';
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
