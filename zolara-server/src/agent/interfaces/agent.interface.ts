export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content?: string;
  error?: string;
  sessionId?: string;
  timestamp: string;
}

export interface AgentResponse {
  content: string;
  sessionId: string;
  timestamp: string;
  tokensUsed?: number;
}

export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
