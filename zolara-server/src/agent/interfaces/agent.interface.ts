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

export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchResults?: any[];
  wasGrounded?: boolean;
}

export interface AgentResponse {
  content: string;
  sessionId: string;
  timestamp: string;
  tokensUsed?: number;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingConfig {
  enableGoogleSearch?: boolean;
  enableGoogleSearchRetrieval?: boolean;
  dynamicThreshold?: number; // For dynamic retrieval (0.0 to 1.0)
}

export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  grounding?: GroundingConfig;
}
