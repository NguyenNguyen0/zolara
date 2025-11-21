import { create } from "zustand";
import { agentService, AgentMessage, StreamChunk } from "../services/agent-service";
import { useAuthStore } from "./authStore";

interface ChatbotState {
  messages: AgentMessage[];
  isConnected: boolean;
  isTyping: boolean;
  currentStreamingMessageId: string | null;
  sessionId: string;
  error: string | null;
}

interface ChatbotActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

// Generate unique message ID
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChatbotStore = create<ChatbotState & ChatbotActions>((set, get) => {
  // Initial session ID
  const initialSessionId = generateSessionId();

  // Connection status handler
  const handleConnectionChange = (connected: boolean) => {
    set({ isConnected: connected });
    if (!connected) {
      set({ error: "Disconnected from agent service" });
    } else {
      set({ error: null });
    }
  };

  // Register connection handler
  agentService.onConnectionChange(handleConnectionChange);

  return {
    messages: [],
    isConnected: false,
    isTyping: false,
    currentStreamingMessageId: null,
    sessionId: initialSessionId,
    error: null,

    connect: async () => {
      try {
        console.log("Connecting to agent service...");
        const connected = await agentService.connect();
        
        if (connected) {
          set({ isConnected: true, error: null });
          console.log("Successfully connected to agent service");
          
          // Only send welcome message if messages array is empty
          const currentState = get();
          if (currentState.messages.length === 0) {
            const welcomeMessageId = generateMessageId();
            const welcomeMessage: AgentMessage = {
              id: welcomeMessageId,
              content: "👋 Xin chào! Tôi là **Zolara AI Assistant**. Tôi có thể giúp gì cho bạn hôm nay?",
              userId: "agent",
              timestamp: new Date().toISOString(),
              type: "text",
            };
            
            set((state) => ({
              messages: [...state.messages, welcomeMessage],
            }));
          }
        } else {
          set({ 
            isConnected: false, 
            error: "Failed to connect to agent service" 
          });
          console.error("Failed to connect to agent service");
        }
      } catch (error) {
        console.error("Error connecting to agent service:", error);
        set({ 
          isConnected: false, 
          error: "Connection error" 
        });
      }
    },

    disconnect: () => {
      agentService.disconnect();
      set({ 
        isConnected: false, 
        isTyping: false,
        currentStreamingMessageId: null 
      });
    },

    sendMessage: async (content: string) => {
      const state = get();
      
      if (!state.isConnected) {
        set({ error: "Not connected to agent service" });
        return;
      }

      // Get current user
      const { user } = useAuthStore.getState();
      const currentUserId = user?.userId || "user";

      // Create user message
      const userMessageId = generateMessageId();
      const userMessage: AgentMessage = {
        id: userMessageId,
        content,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      // Add user message to state
      set((state) => ({
        messages: [...state.messages, userMessage],
        error: null,
      }));

      // Create streaming agent message
      const agentMessageId = generateMessageId();
      const agentMessage: AgentMessage = {
        id: agentMessageId,
        content: "",
        userId: "agent",
        timestamp: new Date().toISOString(),
        type: "text",
        isStreaming: true,
      };

      // Add agent message placeholder
      set((state) => ({
        messages: [...state.messages, agentMessage],
        isTyping: true,
        currentStreamingMessageId: agentMessageId,
      }));

      // Handle streaming chunks with buffering
      let contentBuffer = '';
      let bufferTimeout: ReturnType<typeof setTimeout> | null = null;
      let chunkCounter = 0;
      
      const flushBuffer = () => {
        if (contentBuffer) {
          const bufferContent = contentBuffer;
          contentBuffer = '';
          
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === agentMessageId
                ? { ...msg, content: msg.content + bufferContent }
                : msg
            ),
          }));
        }
      };
      
      const handleChunk = (chunk: StreamChunk) => {
        const currentState = get();
        
        if (chunk.type === "content" && chunk.content) {
          chunkCounter++;
          // Add to buffer
          contentBuffer += chunk.content;
          
          // Clear existing timeout
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
          }
          
          // Flush buffer after a short delay or when buffer is large enough
          if (contentBuffer.length >= 50) {
            flushBuffer();
          } else {
            bufferTimeout = setTimeout(() => {
              flushBuffer();
            }, 50);
          }
          
          console.log(`Received chunk #${chunkCounter}, buffer size: ${contentBuffer.length}`);
        } else if (chunk.type === "done") {
          // Flush any remaining buffer
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
          }
          flushBuffer();
          
          // Streaming complete
          console.log(`Streaming complete for session: ${chunk.sessionId}, total chunks: ${chunkCounter}`);
          
          // Small delay to ensure final buffer flush is processed
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === agentMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              ),
              isTyping: false,
              currentStreamingMessageId: null,
            }));
          }, 100);
          
          // Clear handlers
          agentService.clearHandlers(currentState.sessionId);
        } else if (chunk.type === "error") {
          // Handle error
          console.error("Streaming error:", chunk.error);
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === agentMessageId
                ? { 
                    ...msg, 
                    isStreaming: false,
                    error: chunk.error || "Failed to get response",
                    content: msg.content || "❌ Error: Failed to get response"
                  }
                : msg
            ),
            isTyping: false,
            currentStreamingMessageId: null,
            error: chunk.error || "Failed to get response",
          }));
          
          // Clear handlers
          agentService.clearHandlers(currentState.sessionId);
        }
      };

      // Handle errors
      const handleError = (error: any) => {
        console.error("Agent service error:", error);
        const errorMessage = error.error || error.message || "Unknown error";
        
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === agentMessageId
              ? { 
                  ...msg, 
                  isStreaming: false,
                  error: errorMessage,
                  content: `❌ Error: ${errorMessage}`
                }
              : msg
          ),
          isTyping: false,
          currentStreamingMessageId: null,
          error: errorMessage,
        }));
      };

      // Send message to agent service
      try {
        agentService.sendMessage(
          content,
          state.sessionId,
          handleChunk,
          handleError
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        handleError(error);
      }
    },

    clearMessages: () => {
      set({ 
        messages: [],
        error: null,
        isTyping: false,
        currentStreamingMessageId: null,
      });
    },

    setError: (error: string | null) => {
      set({ error });
    },
  };
});
