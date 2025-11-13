import type {
	ChatMessage,
	GeminiContent,
	SSEEvent,
} from '../../types/agent';

// Helper function to create standardized error responses
export const createErrorResponse = (
	res: any,
	statusCode: number,
	error: string,
	message: string,
	example: string | null = null,
) => {
	const errorObj: any = { error, message };
	if (example) errorObj.example = example;
	return res.status(statusCode).json(errorObj);
};

// Helper function to get topics count with validation
export const getValidatedTopicsCount = (queryCount: string | number | undefined): number => {
	return Math.min(Math.max(parseInt(String(queryCount)) || 3, 1), 5);
};

export const getValidatedTopic = (topic: string | undefined): string => {
	return topic ?? 'tin tức, drama';
};

// Helper function to convert conversation history to Gemini format
export const convertHistoryToGeminiFormat = (
	history: ChatMessage[] | undefined,
	userMessage: string,
): GeminiContent[] => {
	const contents: GeminiContent[] = [];

	// Add conversation history
	if (history && Array.isArray(history)) {
		for (const msg of history) {
			contents.push({
				role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
				parts: [{ text: msg.content }],
			});
		}
	}

	// Add the new user message
	contents.push({
		role: 'user' as const,
		parts: [{ text: userMessage }],
	});

	return contents;
};

// Helper function to validate and parse chat parameters
export const validateChatParams = (
	userMessage: string,
	history?: string | ChatMessage[],
): { userMessage: string; history: ChatMessage[] | undefined } => {
	if (!userMessage) {
		throw new Error('Missing userMessage parameter');
	}

	let parsedHistory: ChatMessage[] | undefined = undefined;
	if (typeof history === 'string') {
		try {
			parsedHistory = JSON.parse(history) as ChatMessage[];
		} catch (parseError) {
			throw new Error(
				'Invalid history format. Must be valid JSON array.',
			);
		}
	} else if (Array.isArray(history)) {
		parsedHistory = history;
	}

	return { userMessage, history: parsedHistory };
};

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
