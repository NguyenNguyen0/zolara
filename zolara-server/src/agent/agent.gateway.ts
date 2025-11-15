import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentChatDto } from './dto/agent-chat.dto';
import { StreamChunk } from './interfaces/agent.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/agent',
  pingInterval: 30000,
  pingTimeout: 30000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  connectTimeout: 60000,
  maxHttpBufferSize: 1e8,
})
export class AgentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AgentGateway.name);
  private connectedClients: Map<string, Socket> = new Map();
  private lastActivity: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly agentService: AgentService) {}

  afterInit() {
    this.logger.log('Agent WebSocket Gateway initialized');

    // Setup cleanup interval for inactive connections
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // 1 minute
  }

  handleConnection(client: Socket) {
    try {
      const clientId = client.id;
      this.connectedClients.set(clientId, client);
      this.lastActivity.set(clientId, Date.now());

      this.logger.log(
        `Agent client connected: ${clientId}, transport: ${client.conn.transport.name}`,
      );

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to Zolara AI Agent',
        clientId,
        timestamp: new Date().toISOString(),
        agentAvailable: this.agentService.isConfigured(),
      });

      // Join a general agent room for broadcasts
      void client.join('agent-users');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in agent connection: ${errorMessage}`);
      client.emit('connectionError', {
        message: 'Error establishing connection to agent service',
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const clientId = client.id;
      this.connectedClients.delete(clientId);
      this.lastActivity.delete(clientId);

      this.logger.log(`Agent client disconnected: ${clientId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in agent disconnection: ${errorMessage}`);
    }
  }

  private cleanupInactiveConnections() {
    const now = Date.now();
    const inactivityThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, lastActive] of this.lastActivity.entries()) {
      if (now - lastActive > inactivityThreshold) {
        const client = this.connectedClients.get(clientId);
        if (client) {
          this.logger.warn(`Disconnecting inactive agent client: ${clientId}`);

          try {
            client.emit('connectionTimeout', {
              message: 'Connection inactive, disconnecting',
              timestamp: new Date().toISOString(),
            });
            client.disconnect(true);
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              `Error disconnecting inactive client: ${errorMessage}`,
            );
          }
        }
      }
    }
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    try {
      this.lastActivity.set(client.id, Date.now());
      return {
        status: 'ok',
        timestamp: Date.now(),
        agentAvailable: this.agentService.isConfigured(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in agent heartbeat: ${errorMessage}`);
      return {
        status: 'error',
        message: errorMessage,
        timestamp: Date.now(),
      };
    }
  }

  @SubscribeMessage('chat')
  async handleStreamChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatDto: AgentChatDto,
  ) {
    const clientId = client.id;

    try {
      // Update activity
      this.lastActivity.set(clientId, Date.now());

      // Validate agent service
      if (!this.agentService.isConfigured()) {
        client.emit('chatError', {
          error: 'AI agent service is not properly configured',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate input
      if (!chatDto.message || chatDto.message.trim().length === 0) {
        client.emit('chatError', {
          error: 'Message content is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this.logger.log(
        `Agent streaming chat request from client ${clientId}: ${chatDto.message.substring(0, 100)}...`,
      );

      // Send acknowledgment that we're processing
      client.emit('chatStarted', {
        sessionId: chatDto.sessionId,
        timestamp: new Date().toISOString(),
      });

      // Stream the response
      try {
        for await (const chunk of this.agentService.streamChat(chatDto)) {
          // Update activity on each chunk
          this.lastActivity.set(clientId, Date.now());

          // Send chunk to client
          client.emit('chatChunk', chunk);

          // Log progress
          if (chunk.type === 'content') {
            this.logger.debug(
              `Sent chunk to client ${clientId}: ${chunk.content?.substring(0, 50)}...`,
            );
          } else if (chunk.type === 'done') {
            this.logger.log(
              `Chat stream completed for client ${clientId}, session: ${chunk.sessionId}`,
            );
          } else if (chunk.type === 'error') {
            this.logger.error(
              `Chat stream error for client ${clientId}: ${chunk.error}`,
            );
          }
        }
      } catch (streamError: unknown) {
        const streamErrorMessage =
          streamError instanceof Error
            ? streamError.message
            : 'Unknown stream error';
        this.logger.error(
          `Stream processing error for client ${clientId}: ${streamErrorMessage}`,
        );

        client.emit('chatChunk', {
          type: 'error',
          error: 'Failed to process chat stream',
          sessionId: chatDto.sessionId,
          timestamp: new Date().toISOString(),
        } as StreamChunk);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error in agent stream chat for client ${clientId}: ${errorMessage}`,
        errorStack,
      );

      client.emit('chatError', {
        error: 'Failed to process chat request',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('getStatus')
  handleGetStatus(@ConnectedSocket() client: Socket) {
    try {
      this.lastActivity.set(client.id, Date.now());

      const status = {
        agentAvailable: this.agentService.isConfigured(),
        connectedClients: this.connectedClients.size,
        timestamp: new Date().toISOString(),
      };

      return status;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting agent status: ${errorMessage}`);
      return {
        error: 'Failed to get status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Broadcast a message to all connected clients (for admin purposes)
   */
  broadcastToAll(message: any) {
    try {
      this.server.to('agent-users').emit('broadcast', {
        ...message,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Broadcasted message to ${this.connectedClients.size} agent clients`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error broadcasting to agent clients: ${errorMessage}`);
    }
  }

  /**
   * Get current connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup method for module destruction
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.log('Agent Gateway cleanup interval cleared');
    }
  }
}
