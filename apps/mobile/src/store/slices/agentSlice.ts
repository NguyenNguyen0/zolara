import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { agentApi, type ChatMessage, type TopicsResponse, type ChatStreamEvent } from '@/src/services/agentApi';

// Types
export interface AgentMessage {
	id: string;
	content: string;
	role: 'user' | 'assistant';
	timestamp: string; // ISO string for Redux serialization
	isStreaming?: boolean;
	error?: string;
}

export interface AgentState {
	messages: AgentMessage[];
	topics: string[];
	isLoadingTopics: boolean;
	isStreaming: boolean;
	currentStreamingMessageId: string | null;
	error: string | null;
	conversationStarted: boolean;
	streamingDebugInfo?: {
		chunksReceived: number;
		totalLength: number;
		lastChunkTime: string;
	};
}

const initialState: AgentState = {
	messages: [],
	topics: [],
	isLoadingTopics: false,
	isStreaming: false,
	currentStreamingMessageId: null,
	error: null,
	conversationStarted: false,
	streamingDebugInfo: undefined,
};

// Async thunks
export const fetchTopics = createAsyncThunk(
	'agent/fetchTopics',
	async ({ count = 3, topic = 'tin tức, drama' }: { count?: number; topic?: string } = {}) => {
		return await agentApi.getTopics(count, topic);
	}
);

// Helper function to generate unique ID
const generateMessageId = (): string => {
	return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to convert AgentMessage to ChatMessage for API
const convertToChatHistory = (messages: AgentMessage[]): ChatMessage[] => {
	return messages
		.filter(msg => !msg.isStreaming && !msg.error) // Exclude streaming and error messages
		.map(msg => ({
			role: msg.role,
			content: msg.content
		}));
};

const agentSlice = createSlice({
	name: 'agent',
	initialState,
	reducers: {
		// Send user message and start streaming
		sendMessage: (state, action: PayloadAction<string>) => {
			const now = new Date().toISOString();
			const userMessage: AgentMessage = {
				id: generateMessageId(),
				content: action.payload,
				role: 'user',
				timestamp: now,
			};

			const assistantMessage: AgentMessage = {
				id: generateMessageId(),
				content: '',
				role: 'assistant',
				timestamp: now,
				isStreaming: true,
			};

			state.messages.push(userMessage, assistantMessage);
			state.isStreaming = true;
			state.currentStreamingMessageId = assistantMessage.id;
			state.error = null;
			state.conversationStarted = true;
		},

		// Handle streaming events
		handleStreamEvent: (state, action: PayloadAction<ChatStreamEvent>) => {
			const event = action.payload;
			const messageId = state.currentStreamingMessageId;

			if (!messageId) return;

			const message = state.messages.find(msg => msg.id === messageId);
			if (!message) return;

			switch (event.type) {
				case 'connected':
					// Initialize streaming debug info
					state.streamingDebugInfo = {
						chunksReceived: 0,
						totalLength: 0,
						lastChunkTime: event.timestamp,
					};
					break;

				case 'chunk':
					if (event.text) {
						message.content += event.text;

						// Update debug info
						if (state.streamingDebugInfo) {
							state.streamingDebugInfo.chunksReceived++;
							state.streamingDebugInfo.totalLength = message.content.length;
							state.streamingDebugInfo.lastChunkTime = event.timestamp;
						}
					}
					break;

				case 'complete':
					// Ensure any final content is properly set
					if (event.text) {
						message.content += event.text;
					}

					// Final content validation and cleanup
					const finalContent = message.content.trim();
					if (finalContent.length > 0) {
						message.content = finalContent;
					}

					// Log completion stats for debugging
					if (state.streamingDebugInfo) {
						console.log('Stream completed:', {
							chunks: state.streamingDebugInfo.chunksReceived,
							finalLength: message.content.length,
							duration: new Date(event.timestamp).getTime() - new Date(state.streamingDebugInfo.lastChunkTime).getTime(),
						});
					}

					message.isStreaming = false;
					state.isStreaming = false;
					state.currentStreamingMessageId = null;
					state.streamingDebugInfo = undefined;
					break;

				case 'error':
					message.error = event.error || 'Unknown streaming error';
					message.isStreaming = false;
					state.isStreaming = false;
					state.currentStreamingMessageId = null;
					state.error = event.error || 'Failed to get response';
					state.streamingDebugInfo = undefined;
					break;
			}
		},

		// Handle streaming errors
		handleStreamError: (state, action: PayloadAction<string>) => {
			const messageId = state.currentStreamingMessageId;

			if (messageId) {
				const message = state.messages.find(msg => msg.id === messageId);
				if (message) {
					message.error = action.payload;
					message.isStreaming = false;
				}
			}

			state.isStreaming = false;
			state.currentStreamingMessageId = null;
			state.error = action.payload;
		},

		// Clear conversation
		clearConversation: (state) => {
			state.messages = [];
			state.conversationStarted = false;
			state.error = null;
			state.isStreaming = false;
			state.currentStreamingMessageId = null;
			state.streamingDebugInfo = undefined;
		},

		// Clear error
		clearError: (state) => {
			state.error = null;
		},

		// Retry failed message
		retryMessage: (state, action: PayloadAction<string>) => {
			const messageId = action.payload;
			const message = state.messages.find(msg => msg.id === messageId);

			if (message && message.error) {
				message.error = undefined;
				message.content = '';
				message.isStreaming = true;
				state.currentStreamingMessageId = messageId;
				state.isStreaming = true;
				state.error = null;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTopics.pending, (state) => {
				state.isLoadingTopics = true;
				state.error = null;
			})
			.addCase(fetchTopics.fulfilled, (state, action: PayloadAction<TopicsResponse>) => {
				state.isLoadingTopics = false;
				state.topics = action.payload.topics;
			})
			.addCase(fetchTopics.rejected, (state, action) => {
				state.isLoadingTopics = false;
				state.error = action.error.message || 'Failed to load topics';
			});
	},
});

// Thunk to handle streaming chat
export const sendMessageWithStream = createAsyncThunk<
	void,
	string,
	{ state: { agent: AgentState } }
>(
	'agent/sendMessageWithStream',
	async (message, { dispatch, getState }) => {
		// Send the user message first
		dispatch(sendMessage(message));

		const state = getState().agent;
		const chatHistory = convertToChatHistory(
			state.messages.filter(msg => !msg.isStreaming) // Exclude the current streaming message
		);

		try {
			// Use the simplified streaming approach
			await agentApi.chatStream(
				message,
				chatHistory,
				(event) => {
					dispatch(handleStreamEvent(event));
				},
				(error) => {
					dispatch(handleStreamError(error));
				}
			);
		} catch (error: any) {
			dispatch(handleStreamError(
				error.response?.data?.message || error.message || 'Failed to get AI response'
			));
		}
	}
);

// Thunk to handle retrying failed messages
export const retryFailedMessage = createAsyncThunk<
	void,
	string,
	{ state: { agent: AgentState } }
>(
	'agent/retryFailedMessage',
	async (messageId, { dispatch, getState }) => {
		const state = getState().agent;
		const failedMessage = state.messages.find(msg => msg.id === messageId);

		if (!failedMessage || !failedMessage.error) {
			return;
		}

		// Find the user message that triggered this failed response
		const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
		const userMessage = messageIndex > 0 ? state.messages[messageIndex - 1] : null;

		if (!userMessage || userMessage.role !== 'user') {
			dispatch(handleStreamError('Cannot retry: Original user message not found'));
			return;
		}

		// Reset the failed message
		dispatch(retryMessage(messageId));

		// Get chat history excluding the failed message
		const chatHistory = convertToChatHistory(
			state.messages.slice(0, messageIndex).filter(msg => !msg.error)
		);

		try {
			// Use the simplified streaming approach
			await agentApi.chatStream(
				userMessage.content,
				chatHistory,
				(event) => {
					dispatch(handleStreamEvent(event));
				},
				(error) => {
					dispatch(handleStreamError(error));
				}
			);
		} catch (error: any) {
			dispatch(handleStreamError(
				error.response?.data?.message || error.message || 'Retry failed to get AI response'
			));
		}
	}
);

export const {
	sendMessage,
	handleStreamEvent,
	handleStreamError,
	clearConversation,
	clearError,
	retryMessage,
} = agentSlice.actions;

// Selectors
export const selectMessages = (state: { agent: AgentState }) => state.agent.messages;
export const selectTopics = (state: { agent: AgentState }) => state.agent.topics;
export const selectIsLoadingTopics = (state: { agent: AgentState }) => state.agent.isLoadingTopics;
export const selectIsStreaming = (state: { agent: AgentState }) => state.agent.isStreaming;
export const selectError = (state: { agent: AgentState }) => state.agent.error;
export const selectConversationStarted = (state: { agent: AgentState }) => state.agent.conversationStarted;

export default agentSlice.reducer;
