import { create } from "zustand";
import { Conversation } from "@/types";
import { conversationService } from "@/services/conversation-service";

interface ConversationsState {
  conversations: Conversation[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  typingUsers: Map<string, { userId: string; timestamp: Date }>; // Map<conversationId, typingInfo>

  // Actions
  fetchConversations: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (conversationId: string, type: "USER" | "GROUP") => Promise<void>;
  markMessageAsRead: (
    messageId: string,
    conversationId: string,
    type: "USER" | "GROUP",
  ) => void;
  markMessageAsUnread: (
    messageId: string,
    conversationId: string,
    type: "USER" | "GROUP",
  ) => Promise<void>;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  clearConversations: () => void;
  setTypingUser: (
    conversationId: string,
    userId: string,
    timestamp: Date,
  ) => void;
  removeTypingUser: (conversationId: string) => void;
  isUserTypingInConversation: (conversationId: string) => boolean;
}

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: [],
  totalCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  typingUsers: new Map(),

  fetchConversations: async (page = 1, limit = 20) => {
    try {
      set({ loading: true, error: null });

      const result = await conversationService.getConversations(page, limit);

      if (result) {
        const { conversations, totalCount } = result;

        // Determine if there are more conversations to load
        const hasMore = page * limit < totalCount;

        if (page === 1) {
          // Replace all conversations if it's the first page
          set({
            conversations,
            totalCount,
            currentPage: page,
            hasMore,
          });
        } else {
          // Append conversations for pagination
          set((state) => ({
            conversations: [...state.conversations, ...conversations],
            totalCount,
            currentPage: page,
            hasMore,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ error: "Không thể tải danh sách cuộc trò chuyện" });
    } finally {
      set({ loading: false });
    }
  },

  updateConversation: (id, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv,
      ),
    }));
  },

  addConversation: (conversation) => {
    set((state) => {
      // Check if conversation already exists
      const exists = state.conversations.some(
        (conv) => conv.id === conversation.id,
      );

      if (exists) {
        // Update existing conversation
        return {
          conversations: state.conversations.map((conv) =>
            conv.id === conversation.id ? { ...conv, ...conversation } : conv,
          ),
        };
      } else {
        // Add new conversation at the beginning of the list
        return {
          conversations: [conversation, ...state.conversations],
          totalCount: state.totalCount + 1,
        };
      }
    });
  },

  removeConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      totalCount: state.totalCount - 1,
    }));
  },

  clearConversations: () => {
    set({ conversations: [], totalCount: 0, currentPage: 1, hasMore: true });
  },

  markAsRead: async (conversationId, type) => {
    try {
      // Gọi API để đánh dấu tất cả tin nhắn đã đọc
      const result = await conversationService.markAllMessagesAsRead(
        type,
        conversationId,
      );

      if (result.success) {
        // Cập nhật trạng thái local
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            const isMatch =
              (type === "USER" &&
                conv.type === "USER" &&
                conv.user?.id === conversationId) ||
              (type === "GROUP" &&
                conv.type === "GROUP" &&
                conv.group?.id === conversationId);

            return isMatch ? { ...conv, unreadCount: 0 } : conv;
          }),
        }));
      } else {
        console.error("Failed to mark messages as read:", result.error);
      }
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  },

  // Đánh dấu một tin nhắn cụ thể là đã đọc - không gọi API
  markMessageAsRead: (messageId, conversationId, type) => {
    // Cập nhật trạng thái local
    set((state) => {
      const conversation = state.conversations.find((conv) => {
        if (type === "USER" && conv.type === "USER") {
          return conv.user?.id === conversationId;
        } else if (type === "GROUP" && conv.type === "GROUP") {
          return conv.group?.id === conversationId;
        }
        return false;
      });

      if (conversation) {
        return {
          conversations: state.conversations.map((conv) =>
            conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv,
          ),
        };
      }

      return state; // Không thay đổi nếu không tìm thấy cuộc trò chuyện
    });
  },

  // Đánh dấu một tin nhắn cụ thể là chưa đọc
  markMessageAsUnread: async (messageId, conversationId, type) => {
    try {
      await conversationService.markMessageAsUnread(messageId);

      // Cập nhật trạng thái local
      set((state) => {
        const conversation = state.conversations.find((conv) => {
          if (type === "USER" && conv.type === "USER") {
            return conv.user?.id === conversationId;
          } else if (type === "GROUP" && conv.type === "GROUP") {
            return conv.group?.id === conversationId;
          }
          return false;
        });

        if (conversation) {
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === conversation.id
                ? { ...conv, unreadCount: conv.unreadCount + 1 }
                : conv,
            ),
          };
        }

        return state;
      });
    } catch (error) {
      console.error("Error marking message as unread:", error);
    }
  },

  // Phương thức đánh dấu người dùng đang typing trong một cuộc trò chuyện
  setTypingUser: (conversationId, userId, timestamp) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(conversationId, { userId, timestamp });

      // Tự động xóa trạng thái typing sau 5 giây nếu không nhận được cập nhật mới
      setTimeout(() => {
        const currentTypingInfo = get().typingUsers.get(conversationId);
        if (currentTypingInfo && currentTypingInfo.timestamp === timestamp) {
          get().removeTypingUser(conversationId);
        }
      }, 5000);

      return { typingUsers: newTypingUsers };
    });
  },

  // Phương thức xóa trạng thái typing của một cuộc trò chuyện
  removeTypingUser: (conversationId) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.delete(conversationId);
      return { typingUsers: newTypingUsers };
    });
  },

  // Phương thức kiểm tra xem có người đang typing trong một cuộc trò chuyện không
  isUserTypingInConversation: (conversationId) => {
    const typingInfo = get().typingUsers.get(conversationId);
    if (!typingInfo) return false;

    // Kiểm tra xem trạng thái typing có còn hiệu lực không (trong vòng 5 giây)
    const now = new Date();
    const diff = now.getTime() - typingInfo.timestamp.getTime();
    return diff < 5000; // 5 giây
  },
}));
