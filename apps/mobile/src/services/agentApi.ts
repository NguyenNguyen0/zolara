import axiosClient from '@/src/config/axios.client';
import EventSource from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface TopicsResponse {
	topics: string[];
	fallback?: boolean;
}

export interface ChatResponse {
	userMessage: string;
	response: string;
	timestamp: string;
	conversationLength: number;
}

export interface ChatStreamEvent {
	type: 'connected' | 'chunk' | 'complete' | 'error';
	text?: string;
	message?: string;
	userMessage?: string;
	conversationLength?: number;
	timestamp: string;
	error?: string;
}

// API Methods
export const agentApi = {
	// Get suggested discussion topics
	getTopics: async (count: number = 3, topic: string = 'tin tức, drama'): Promise<TopicsResponse> => {
		const response = await axiosClient.get<TopicsResponse>('/api/agent/topics', {
			params: { count, topic }
		});
		return response.data;
	},

	// Fallback: Get AI chat response (non-streaming)
	chat: async (userMessage: string, history: ChatMessage[] = []): Promise<ChatResponse> => {
		const response = await axiosClient.post<ChatResponse>('/api/agent/chat', {
			userMessage,
			history
		});
		return response.data;
	},

	// Get AI chat response (streaming) using EventSource
	chatStream: async (
		userMessage: string,
		history: ChatMessage[] = [],
		onEvent: (event: ChatStreamEvent) => void,
		onError?: (error: string) => void
	): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			try {
				// Get access token for authentication
				const accessToken = await AsyncStorage.getItem('accessToken');

				// Prepare headers
				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
				};

				if (accessToken) {
					headers['Authorization'] = `Bearer ${accessToken}`;
				}

				// Send initial connected event
				onEvent({
					type: 'connected',
					message: 'Connected to AI',
					timestamp: new Date().toISOString(),
				});

				// Create EventSource with proper URL and headers
				const eventSource = new EventSource(`${axiosClient.defaults.baseURL}/api/agent/chat-stream`, {
					headers,
					method: 'POST',
					body: JSON.stringify({
						userMessage,
						history
					})
				});

				// Handle different event types
				eventSource.addEventListener('open', () => {
					console.log('EventSource connection opened');
				});

				eventSource.addEventListener('message', (event: any) => {
					try {
						const eventData = JSON.parse(event.data) as ChatStreamEvent;
						onEvent(eventData);

						if (eventData.type === 'complete') {
							eventSource.close();
							resolve();
						} else if (eventData.type === 'error') {
							eventSource.close();
							const error = eventData.error || 'Unknown streaming error';
							onError?.(error);
							reject(new Error(error));
						}
					} catch (parseError) {
						console.warn('Failed to parse SSE event:', event.data, parseError);
						// Continue processing other events instead of failing completely
					}
				});

				eventSource.addEventListener('error', async (error: any) => {
					console.error('EventSource error:', error);
					eventSource.close();

					// If streaming fails, fallback to regular chat API
					try {
						console.log('Falling back to regular chat API...');

						// Use the regular chat API as fallback
						const response = await axiosClient.post('/api/agent/chat', {
							userMessage,
							history
						});

					// Extract response - the server returns the chat response directly
					const chatResponse = response.data as ChatResponse;

					if (!chatResponse || !chatResponse.response) {
						console.error('Invalid response structure:', response.data);
						throw new Error('Invalid response structure from server');
					}						// Simulate streaming by breaking the response into chunks
						const words = chatResponse.response.split(' ');
						const chunkSize = Math.max(1, Math.floor(words.length / 15)); // Divide into ~15 chunks
						let totalSent = '';

						for (let i = 0; i < words.length; i += chunkSize) {
							const chunk = words.slice(i, i + chunkSize).join(' ');
							if (chunk.trim()) {
								const chunkWithSpace = chunk + (i + chunkSize < words.length ? ' ' : '');
								totalSent += chunkWithSpace;
								onEvent({
									type: 'chunk',
									text: chunkWithSpace,
									timestamp: new Date().toISOString(),
								});
								// Small delay to simulate streaming
								await new Promise(resolve => setTimeout(resolve, 80));
							}
						}

						// Ensure any remaining content is sent in the complete event
						const remainingContent = chatResponse.response.substring(totalSent.length);

						// Send completion event with any final content
						onEvent({
							type: 'complete',
							text: remainingContent || '', // Include any final content
							message: 'Response complete',
							timestamp: chatResponse.timestamp || new Date().toISOString(),
						});

						resolve();
					} catch (fallbackError: any) {
						console.error('Fallback chat API also failed:', fallbackError);
						const errorMessage = fallbackError.response?.data?.message || fallbackError.message || 'Failed to get AI response';

						onEvent({
							type: 'error',
							error: errorMessage,
							timestamp: new Date().toISOString(),
						});

						onError?.(errorMessage);
						reject(fallbackError);
					}
				});

				// Set up timeout to prevent hanging
				const timeoutId = setTimeout(() => {
					console.log('EventSource timeout, closing connection');
					eventSource.close();
					onError?.('Request timeout');
					reject(new Error('Request timeout'));
				}, 30000); // 30 second timeout

				// Clear timeout when connection resolves
				const originalResolve = resolve;
				const originalReject = reject;
				resolve = (...args: any[]) => {
					clearTimeout(timeoutId);
					originalResolve(...args);
				};
				reject = (...args: any[]) => {
					clearTimeout(timeoutId);
					originalReject(...args);
				};

			} catch (error: any) {
				console.error('Chat stream setup error:', error);
				const errorMessage = error.message || 'Network error occurred';

				onEvent({
					type: 'error',
					error: errorMessage,
					timestamp: new Date().toISOString(),
				});

				onError?.(errorMessage);
				reject(error);
			}
		});
	}
};

export default agentApi;
