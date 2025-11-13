import { Request, Response } from 'express';
import {
	generateContent,
	generateContentWithJsonSchema,
	getChatResponse,
	getChatStreamResponse,
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


// Controller for getting suggested discussion topics
export const getTopics = async (req: Request, res: Response) => {
	try {
		const count = getValidatedTopicsCount(req.query.count as string);
		const topic = getValidatedTopic(req.query.topic as string);

		// First, search for current news
		const searchResponse = await generateContent(
			`Tổng hợp ${count} chủ đề nóng hổi, đang được quan tâm nhất hiện nay ở Việt Nam và thế giới.
            Ưu tiên các chủ đề về: thời sự, chiến sự, thiên tai, xu hướng mạng xã hội, công nghệ, chính trị, giải trí, thể thao.
            Mỗi chủ đề nên ngắn gọn (dưới 20 ký tự), gợi tò mò và dễ hiểu.`,
			{ tools: [{ googleSearch: {} }] },
		);

		// Then format the results using JSON schema
		const TopicSchema = {
			type: 'object',
			properties: {
				topics: {
					type: 'array',
					description: 'Danh sách chủ đề trò chuyện',
					items: { type: 'string' },
					minItems: 1,
					maxItems: 5,
				},
			},
			required: ['topics'],
		};
		const formatResponse = await generateContentWithJsonSchema(
			`Từ nội dung sau, hãy tạo danh sách ${count} chủ đề tin tức thật hấp dẫn,
                ví dụ như: "Chiến sự Ukraine", "Nội chiến Sudan", "Bão số 14", "OpenAI Agents SDK".
                Tránh tiêu đề chung chung hoặc quá dài.
                Đầu ra chỉ gồm tên chủ đề ngắn, rõ, hấp dẫn, đúng định dạng JSON.
                Nội dung: ${searchResponse.text}
            `,
			TopicSchema,
		);

		const topicResponse = TopicsResponseSchema.parse(
			JSON.parse(formatResponse.text as string),
		);

		res.json(topicResponse);
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
