import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, ModelParams, Tool } from '@google/generative-ai';
import {
  ChatMessage,
  StreamChunk,
  AgentResponse,
  AgentConfig,
  GroundingConfig,
  GroundingMetadata,
} from './interfaces/agent.interface';

// Internal interfaces for Google AI response structure
interface GoogleAICandidate {
  groundingMetadata?: {
    webSearchQueries?: unknown[];
    searchResults?: unknown[];
  };
}

interface GoogleAIResponse {
  candidates?: GoogleAICandidate[];
  usageMetadata?: {
    totalTokenCount?: number;
  };
}
import { AgentChatDto } from './dto/agent-chat.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly defaultConfig: AgentConfig;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.defaultConfig = {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: `Bạn là ** Zolara Agent** — một ** trợ lý ảo thân thiện, thông minh và am hiểu xu hướng **.
Nhiệm vụ của bạn là ** trò chuyện tự nhiên, tích cực và hữu ích ** với người dùng về các ** tin tức, thời sự, xu hướng mạng xã hội và thông tin đời sống **.

#### ** Hướng dẫn:**

* Giao tiếp tự nhiên, gần gũi, thân thiện như một người bạn hiểu biết.
* Giữ ** thái độ trung lập **, không phán xét hay lan truyền thông tin chưa kiểm chứng.
* Khi không chắc chắn, nói rõ điều đó("Mình chưa có thông tin chính xác, nhưng có thể là…").
* Có thể thêm chút hóm hỉnh, bắt trend nhẹ nhàng nếu phù hợp.
* Luôn cung cấp thông tin ** ngắn gọn, dễ hiểu, hữu ích và cập nhật **.
* Khi phù hợp, gợi ý người dùng khám phá thêm ** xu hướng, tin nổi bật hoặc mẹo hữu ích **.
* Khi có thông tin từ web search, hãy đề cập nguồn và thời gian cập nhật.

#### ** Ví dụ phong cách trả lời:**

* "Hôm nay trên mạng đang rộ trend 'AI tạo ảnh phong cách anime' đó! Bạn có muốn mình chỉ cách thử không ?"
* "Theo các nguồn tin chính thống, tình hình mưa lũ ở miền Trung đã giảm nhẹ so với hôm qua, nhưng vẫn cần đề phòng nhé."
* "Câu chuyện này đang hot trên TikTok luôn! Mình kể bạn nghe nhanh gọn nè…"
* "Mình vừa tìm kiếm thông tin mới nhất và thấy rằng..."`,
      grounding: {
        enableGoogleSearch: true,
        enableGoogleSearchRetrieval: false,
        dynamicThreshold: 0.7,
      },
    };
  }

  /**
   * Build grounding tools configuration
   */
  private buildGroundingTools(): any[] {
    const tools: any[] = [];
    const groundingConfig = this.defaultConfig.grounding;

    if (!groundingConfig) {
      return tools;
    }

    if (groundingConfig.enableGoogleSearch) {
      tools.push({
        googleSearch: {},
      });
      this.logger.log('Google Search grounding enabled');
    }

    if (groundingConfig.enableGoogleSearchRetrieval) {
      tools.push({
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC',
            dynamicThreshold: groundingConfig.dynamicThreshold || 0.7,
          },
        },
      });
      this.logger.log(
        `Google Search Retrieval grounding enabled with threshold: ${
          groundingConfig.dynamicThreshold || 0.7
        }`,
      );
    }

    return tools;
  }

  /**
   * Extract grounding metadata from response
   */
  private extractGroundingMetadata(
    response: GoogleAIResponse,
  ): GroundingMetadata {
    const metadata: GroundingMetadata = {
      webSearchQueries: [],
      searchResults: [],
      wasGrounded: false,
    };

    try {
      if (response?.candidates && response.candidates.length > 0) {
        const groundingMetadata = response.candidates[0]?.groundingMetadata;
        if (groundingMetadata) {
          metadata.wasGrounded = true;

          // Safely handle webSearchQueries
          if (Array.isArray(groundingMetadata.webSearchQueries)) {
            metadata.webSearchQueries =
              groundingMetadata.webSearchQueries.filter(
                (q): q is string => typeof q === 'string',
              );
          } else {
            metadata.webSearchQueries = [];
          }

          // Safely handle searchResults
          if (Array.isArray(groundingMetadata.searchResults)) {
            metadata.searchResults = groundingMetadata.searchResults;
          } else {
            metadata.searchResults = [];
          }
        }
      }
    } catch (error) {
      this.logger.warn('Failed to extract grounding metadata:', error);
    }

    return metadata;
  }

  /**
   * Chat with the AI agent (non-streaming)
   */
  async chat(chatDto: AgentChatDto): Promise<AgentResponse> {
    try {
      const sessionId = chatDto.sessionId || uuidv4();
      const messages = this.buildMessageHistory(chatDto);
      const tools = this.buildGroundingTools();

      const modelConfig: ModelParams = {
        model: this.defaultConfig.model,
        generationConfig: {
          temperature: this.defaultConfig.temperature,
          maxOutputTokens: this.defaultConfig.maxTokens,
        },
        ...(tools.length > 0 && { tools: tools as Tool[] }),
      };

      const model = this.genAI.getGenerativeModel(modelConfig);
      const chat = model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(
        messages[messages.length - 1].content,
      );
      const response = result.response;
      const content = response.text();
      const groundingMetadata = this.extractGroundingMetadata(
        result.response as GoogleAIResponse,
      );

      if (groundingMetadata.wasGrounded) {
        this.logger.log(
          `Agent chat completed for session: ${sessionId} with grounding. Queries: ${
            groundingMetadata.webSearchQueries?.join(', ') || 'none'
          }`,
        );
      } else {
        this.logger.log(`Agent chat completed for session: ${sessionId}`);
      }

      return {
        content,
        sessionId,
        timestamp: new Date().toISOString(),
        tokensUsed:
          (result.response as GoogleAIResponse).usageMetadata
            ?.totalTokenCount || 0,
        groundingMetadata,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in agent chat: ${errorMessage}`, errorStack);
      throw new Error(`Failed to process chat request: ${errorMessage}`);
    }
  }

  /**
   * Stream chat with the AI agent
   */
  async *streamChat(chatDto: AgentChatDto): AsyncGenerator<StreamChunk> {
    const sessionId = chatDto.sessionId || uuidv4();

    try {
      const messages = this.buildMessageHistory(chatDto);
      const tools = this.buildGroundingTools();

      const modelConfig: ModelParams = {
        model: this.defaultConfig.model,
        generationConfig: {
          temperature: this.defaultConfig.temperature,
          maxOutputTokens: this.defaultConfig.maxTokens,
        },
        ...(tools.length > 0 && { tools: tools as Tool[] }),
      };

      const model = this.genAI.getGenerativeModel(modelConfig);
      const chat = model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessageStream(
        messages[messages.length - 1].content,
      );

      let contentChunks = 0;
      let totalContent = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          contentChunks++;
          totalContent += chunkText;
          yield {
            type: 'content',
            content: chunkText,
            sessionId,
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Log final content length for debugging
      this.logger.log(
        `Agent stream content complete for session: ${sessionId}, chunks: ${contentChunks}, total length: ${totalContent.length}`,
      );

      // Yield done signal after all content chunks
      yield {
        type: 'done',
        sessionId,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(
        `Agent stream done signal sent for session: ${sessionId}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in agent stream: ${errorMessage}`, errorStack);

      yield {
        type: 'error',
        error: `Failed to process chat request: ${errorMessage}`,
        sessionId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Build message history for the AI model
   */
  private buildMessageHistory(chatDto: AgentChatDto): ChatMessage[] {
    const messages: ChatMessage[] = [];

    messages.push({
      role: 'system',
      content: this.defaultConfig.systemPrompt,
      timestamp: new Date().toISOString(),
    });

    if (chatDto.history?.length) {
      for (const msg of chatDto.history) {
        messages.push({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        });
      }
    }

    messages.push({
      role: 'user',
      content: chatDto.message,
      timestamp: new Date().toISOString(),
    });

    return messages;
  }

  /**
   * Validate API key availability
   */
  isConfigured(): boolean {
    return !!this.configService.get<string>('GEMINI_API_KEY');
  }

  /**
   * Get current agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Update grounding configuration
   */
  updateGroundingConfig(config: Partial<GroundingConfig>): void {
    if (this.defaultConfig.grounding) {
      this.defaultConfig.grounding = {
        ...this.defaultConfig.grounding,
        ...config,
      };
    } else {
      this.defaultConfig.grounding = {
        enableGoogleSearch: false,
        enableGoogleSearchRetrieval: false,
        dynamicThreshold: 0.7,
        ...config,
      };
    }
    this.logger.log(
      'Grounding configuration updated:',
      this.defaultConfig.grounding,
    );
  }
}
