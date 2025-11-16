import { Socket } from "socket.io-client";
import { socketManager } from "../lib/socket";

// Types for agent communication
export interface AgentMessage {
  id: string;
  content: string;
  userId: string;
  timestamp: string;
  type?: "text" | "image" | "sticker";
  isStreaming?: boolean;
  error?: string;
}

export interface AgentChatDto {
  message: string;
  sessionId?: string;
  userId?: string;
}

export interface StreamChunk {
  type: "content" | "done" | "error" | "metadata";
  content?: string;
  sessionId?: string;
  error?: string;
  timestamp?: string;
  metadata?: {
    model?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
}

export interface AgentStatus {
  agentAvailable: boolean;
  connectedClients?: number;
  timestamp: string;
}

export interface HeartbeatResponse {
  status: "ok" | "error";
  timestamp: number;
  agentAvailable: boolean;
  message?: string;
}

// Agent service class
class AgentService {
  private agentSocket: Socket | null = null;
  private messageHandlers: Map<string, (chunk: StreamChunk) => void> = new Map();
  private errorHandlers: Map<string, (error: any) => void> = new Map();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Connect to the agent namespace
   */
  async connect(): Promise<boolean> {
    try {
      console.log("Connecting to agent namespace...");
      
      // Disconnect existing socket if any
      if (this.agentSocket) {
        this.disconnect();
      }

      // Connect to agent namespace
      this.agentSocket = await socketManager.connectToNamespace("agent");
      
      if (!this.agentSocket) {
        console.error("Failed to create agent socket connection");
        return false;
      }

      // Setup event listeners
      this.setupEventListeners();

      // Start heartbeat
      this.startHeartbeat();

      return true;
    } catch (error) {
      console.error("Failed to connect to agent service:", error);
      return false;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.agentSocket) return;

    // Connection events
    this.agentSocket.on("connected", (data) => {
      console.log("Agent service connected:", data);
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    });

    this.agentSocket.on("connect", () => {
      console.log("Agent socket connected");
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    });

    this.agentSocket.on("disconnect", (reason) => {
      console.log("Agent socket disconnected:", reason);
      this.notifyConnectionHandlers(false);
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
      }
    });

    this.agentSocket.on("connect_error", (error) => {
      console.error("Agent socket connection error:", error);
      this.notifyConnectionHandlers(false);
    });

    this.agentSocket.on("connectionError", (data) => {
      console.error("Agent connection error:", data);
    });

    this.agentSocket.on("connectionTimeout", (data) => {
      console.warn("Agent connection timeout:", data);
      this.disconnect();
    });

    // Chat events
    this.agentSocket.on("chatStarted", (data) => {
      console.log("Chat started:", data);
    });

    this.agentSocket.on("chatChunk", (chunk: StreamChunk) => {
      // Log chunk reception for debugging
      if (chunk.type === "content") {
        console.log(`[Agent] Received content chunk: ${chunk.content?.substring(0, 30)}...`);
      } else if (chunk.type === "done") {
        console.log(`[Agent] Received done signal for session: ${chunk.sessionId}`);
      } else if (chunk.type === "error") {
        console.error(`[Agent] Received error chunk: ${chunk.error}`);
      }
      
      const handler = this.messageHandlers.get(chunk.sessionId || "default");
      if (handler) {
        handler(chunk);
      } else {
        console.warn(`[Agent] No handler found for session: ${chunk.sessionId || "default"}`);
      }
    });

    this.agentSocket.on("chatError", (error) => {
      console.error("Chat error:", error);
      const handler = this.errorHandlers.get("default");
      if (handler) {
        handler(error);
      }
    });

    // Broadcast events
    this.agentSocket.on("broadcast", (message) => {
      console.log("Broadcast message:", message);
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000); // Send heartbeat every 25 seconds
  }

  /**
   * Send heartbeat
   */
  private sendHeartbeat() {
    if (!this.agentSocket || !this.agentSocket.connected) return;

    this.agentSocket.emit("heartbeat", {}, (response: HeartbeatResponse) => {
      if (response.status === "ok") {
        console.log("Heartbeat OK, agent available:", response.agentAvailable);
      } else {
        console.warn("Heartbeat failed:", response.message);
      }
    });
  }

  /**
   * Send a chat message and receive streaming response
   */
  sendMessage(
    message: string,
    sessionId: string,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.agentSocket || !this.agentSocket.connected) {
      console.error("Agent socket not connected");
      if (onError) {
        onError({ error: "Not connected to agent service" });
      }
      return;
    }

    // Register handlers
    this.messageHandlers.set(sessionId, onChunk);
    if (onError) {
      this.errorHandlers.set(sessionId, onError);
    }

    // Send chat message
    const chatDto: AgentChatDto = {
      message,
      sessionId,
    };

    console.log("Sending chat message:", chatDto);
    this.agentSocket.emit("chat", chatDto);
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<AgentStatus | null> {
    return new Promise((resolve) => {
      if (!this.agentSocket || !this.agentSocket.connected) {
        resolve(null);
        return;
      }

      this.agentSocket.emit("getStatus", {}, (status: AgentStatus) => {
        resolve(status);
      });
    });
  }

  /**
   * Register connection status handler
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Notify all connection handlers
   */
  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error("Error in connection handler:", error);
      }
    });
  }

  /**
   * Clear message handler for a session
   */
  clearHandlers(sessionId: string) {
    this.messageHandlers.delete(sessionId);
    this.errorHandlers.delete(sessionId);
  }

  /**
   * Disconnect from agent service
   */
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.agentSocket) {
      this.agentSocket.removeAllListeners();
      this.agentSocket.disconnect();
      this.agentSocket = null;
    }

    this.messageHandlers.clear();
    this.errorHandlers.clear();
    this.reconnectAttempts = 0;
    
    console.log("Agent service disconnected");
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.agentSocket?.connected || false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.agentSocket;
  }
}

// Export singleton instance
export const agentService = new AgentService();
