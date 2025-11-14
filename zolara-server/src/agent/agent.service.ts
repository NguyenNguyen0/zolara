import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ChatMessage,
  StreamChunk,
  AgentResponse,
  AgentConfig,
} from './interfaces/agent.interface';
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
* Khi không chắc chắn, nói rõ điều đó(“Mình chưa có thông tin chính xác, nhưng có thể là…”).
* Có thể thêm chút hóm hỉnh, bắt trend nhẹ nhàng nếu phù hợp.
* Luôn cung cấp thông tin ** ngắn gọn, dễ hiểu, hữu ích và cập nhật **.
* Khi phù hợp, gợi ý người dùng khám phá thêm ** xu hướng, tin nổi bật hoặc mẹo hữu ích **.

#### ** Ví dụ phong cách trả lời:**

* “Hôm nay trên mạng đang rộ trend ‘AI tạo ảnh phong cách anime’ đó! Bạn có muốn mình chỉ cách thử không ?”
* “Theo các nguồn tin chính thống, tình hình mưa lũ ở miền Trung đã giảm nhẹ so với hôm qua, nhưng vẫn cần đề phòng nhé.”
* “Câu chuyện này đang hot trên TikTok luôn! Mình kể bạn nghe nhanh gọn nè…”`,
    };
  }

  /**
   * Chat with the AI agent (non-streaming)
   */
  async chat(chatDto: AgentChatDto): Promise<AgentResponse> {
    try {
      const sessionId = chatDto.sessionId || uuidv4();
      const messages = this.buildMessageHistory(chatDto);

      const model = this.genAI.getGenerativeModel({
        model: this.defaultConfig.model,
        generationConfig: {
          temperature: this.defaultConfig.temperature,
          maxOutputTokens: this.defaultConfig.maxTokens,
        },
      });

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

      this.logger.log(`Agent chat completed for session: ${sessionId}`);

      return {
        content,
        sessionId,
        timestamp: new Date().toISOString(),
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
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

      const model = this.genAI.getGenerativeModel({
        model: this.defaultConfig.model,
        generationConfig: {
          temperature: this.defaultConfig.temperature,
          maxOutputTokens: this.defaultConfig.maxTokens,
        },
      });

      const chat = model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessageStream(
        messages[messages.length - 1].content,
      );

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield {
            type: 'content',
            content: chunkText,
            sessionId,
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Send completion signal
      yield {
        type: 'done',
        sessionId,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Agent stream completed for session: ${sessionId}`);
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

    // Add system prompt
    messages.push({
      role: 'system',
      content: this.defaultConfig.systemPrompt,
      timestamp: new Date().toISOString(),
    });

    // Add conversation history
    if (chatDto.history && chatDto.history.length > 0) {
      for (const msg of chatDto.history) {
        messages.push({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        });
      }
    }

    // Add current user message
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
}
