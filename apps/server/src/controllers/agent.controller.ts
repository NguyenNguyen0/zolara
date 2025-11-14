import { Request, Response } from 'express';
import {
	generateContent,
	generateContentWithJsonSchema,
	getChatResponse,
	getChatStreamResponse,
	generateAndStoreTopics,
	getStoredTopics,
} from '../services/agent.service';
import {
	TopicsResponseSchema,
} from '../validations/agent.validation';
import {
	createErrorResponse,
	getValidatedTopicsCount,
	getValidatedTopic,
	writeSSEEvent,
} from '../utils/helpers/agent.helper';


export const generateTopics = async (req: Request, res: Response) => {
	try {
		const countParam = req.body.count || req.query.count;
		const count = getValidatedTopicsCount(countParam as string);

		// Validate count is within 10-20 range
		const validatedCount = Math.min(Math.max(count, 10), 20);

		// Get the current user ID from request (assumes auth middleware sets this)
		const createdBy = req.user?.uid || 'system';

		const result = await generateAndStoreTopics(validatedCount, createdBy);

		res.json(result);
	} catch (error: any) {
		console.error('Generate topics endpoint error:', error);

		return createErrorResponse(
			res,
			500,
			'Failed to generate topics',
			error.message || 'Unknown error',
			'POST /api/agent/topics with body: {"count": 15}',
		);
	}
};


// Controller for getting suggested discussion topics
export const getTopics = async (req: Request, res: Response) => {
	try {
		const count = getValidatedTopicsCount(req.query.count as string);

		const topicsResponse = await getStoredTopics(count);

		res.json(topicsResponse);
	} catch (error: any) {
		console.error('Topics endpoint error:', error);

		// Fallback response in case of any error
		const fallbackTopics = [
			'Tình hình chiến sự Ukraine',
			'Tranh luận về quy định AI trên toàn cầu',
			'Kết quả hội nghị biến đổi khí hậu',
			'Phát triển công nghệ AI trong năm 2025',
			'Tình hình kinh tế thế giới hiện tại',
		].slice(0, getValidatedTopicsCount(req.query.count as string));

		res.json({
			topics: fallbackTopics,
			fallback: true,
		});
	}
};

// Controller for getting chat response
export const getChat = async (req: Request, res: Response) => {
	try {
		const { userMessage, history } = req.body;

		if (!userMessage || typeof userMessage !== 'string') {
			return createErrorResponse(
				res,
				400,
				'Missing userMessage parameter',
				'userMessage is required',
				'POST /api/v1/agent/chat with body: {"userMessage": "hello", "history": [{"role":"user","content":"hi"},{"role":"assistant","content":"Hello!"}]}',
			);
		}

		const chatResponse = await getChatResponse(userMessage, history);
		res.json(chatResponse);
	} catch (error: any) {
		console.error('Chat endpoint error:', error);

		if (error.message.includes('Invalid history format')) {
			return createErrorResponse(
				res,
				400,
				'Invalid history format. Must be valid JSON array.',
				error.message,
				'[{"role":"user","content":"hi"},{"role":"assistant","content":"Hello!"}]',
			);
		}

		return createErrorResponse(
			res,
			500,
			'Failed to get chat response',
			error.message || 'Unknown error',
		);
	}
};

// Controller for streaming chat response
export const getChatStream = async (req: Request, res: Response) => {
	try {
		const { userMessage, history } = req.body;

		if (!userMessage || typeof userMessage !== 'string') {
			return createErrorResponse(
				res,
				400,
				'Missing userMessage parameter',
				'userMessage is required',
				'POST /api/v1/agent/chat-stream with body: {"userMessage": "hello", "history": [{"role":"user","content":"hi"},{"role":"assistant","content":"Hello!"}]}',
			);
		}

		await getChatStreamResponse(userMessage, history, res);
	} catch (error: any) {
		console.error('Chat stream endpoint error:', error);

		if (error.message && error.message.includes('Invalid history format')) {
			return createErrorResponse(
				res,
				400,
				'Invalid history format. Must be valid JSON array.',
				error.message,
				'[{"role":"user","content":"hi"},{"role":"assistant","content":"Hello!"}]',
			);
		}

		writeSSEEvent(res, {
			type: 'error',
			error: 'Failed to stream chat response',
			message: error.message || 'Unknown error',
			timestamp: new Date().toISOString(),
		});
		res.end();
	}
};
