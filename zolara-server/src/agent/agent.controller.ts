import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { AgentService } from './agent.service';
import { AgentChatDto } from './dto/agent-chat.dto';
import { AgentResponse, AgentConfig } from './interfaces/agent.interface';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  @Public()
  @Post('chat')
  @ApiOperation({
    summary: 'Chat with AI Agent',
    description:
      'Send a message to the AI agent and receive a response. No authentication required.',
  })
  @ApiBody({ type: AgentChatDto })
  @ApiResponse({
    status: 200,
    description: 'Agent response received successfully',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'AI agent response content',
          example:
            "Hello! I'm Zolara AI Assistant. How can I help you with the Zolara messaging app today?",
        },
        sessionId: {
          type: 'string',
          description: 'Session identifier for conversation tracking',
          example: 'session_123456789',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Response timestamp',
          example: '2024-01-01T00:00:00.000Z',
        },
        tokensUsed: {
          type: 'number',
          description: 'Number of tokens used in the request',
          example: 150,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error or AI service unavailable',
  })
  async chat(@Body() chatDto: AgentChatDto): Promise<AgentResponse> {
    try {
      this.logger.log(
        `Agent chat request received: ${chatDto.message.substring(0, 100)}...`,
      );

      if (!this.agentService.isConfigured()) {
        throw new HttpException(
          'AI service is not properly configured',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const response = await this.agentService.chat(chatDto);

      this.logger.log(
        `Agent chat response sent for session: ${response.sessionId}`,
      );
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in agent chat: ${errorMessage}`, errorStack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to process chat request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('config')
  @ApiOperation({
    summary: 'Get Agent Configuration',
    description: 'Retrieve current AI agent configuration settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        model: {
          type: 'string',
          description: 'AI model being used',
          example: 'gemini-1.5-flash',
        },
        temperature: {
          type: 'number',
          description: 'Response creativity level (0-1)',
          example: 0.7,
        },
        maxTokens: {
          type: 'number',
          description: 'Maximum response length in tokens',
          example: 2048,
        },
        systemPrompt: {
          type: 'string',
          description: 'System prompt defining agent behavior',
        },
      },
    },
  })
  getConfig(): AgentConfig {
    return this.agentService.getConfig();
  }

  @Public()
  @Get('status')
  @ApiOperation({
    summary: 'Get Agent Status',
    description:
      'Check if the AI agent service is available and properly configured',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        available: {
          type: 'boolean',
          description: 'Whether the agent service is available',
          example: true,
        },
        configured: {
          type: 'boolean',
          description: 'Whether the agent is properly configured',
          example: true,
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Status check timestamp',
        },
      },
    },
  })
  getStatus() {
    const configured = this.agentService.isConfigured();

    return {
      available: true,
      configured,
      timestamp: new Date().toISOString(),
    };
  }
}
