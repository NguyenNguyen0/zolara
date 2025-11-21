import { create } from "zustand";
import {
  GroupInfo,
  Message,
  MessageReaction,
  ReactionType,
  User,
} from "@/types";
import { messageService } from "@/services/message-service";
import uuid from "react-native-uuid";
import { useSocket } from "@/providers/SocketProvider";
import { useUserStatusStore } from "./userStatusStore";
import { Socket } from "socket.io-client";

interface ChatState {
  messages: Message[];
  loading: boolean;
  refreshing: boolean;
  page: number;
  hasMore: boolean;
  isLoadingMedia: boolean;
  selectedMedia: Array<{
    uri: string;
    type: "IMAGE" | "VIDEO";
    width?: number;
    height?: number;
  }>;
  typingUsers: Map<
    string,
    { timestamp: Date; receiverId?: string; groupId?: string }
  >;
  isTyping: boolean;
  typingDebounceTimeout: NodeJS.Timeout | null;
  currentChat: {
    id: string;
    name: string;
    type: "USER" | "GROUP";
    // Add other common properties between User and Group
  } | null;
  currentChatType: "USER" | "GROUP" | null;
  selectedContact: any | null;
  selectedGroup: GroupInfo | null;

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  setTypingUsers: (data: {
    userId: string;
    timestamp: Date;
    receiverId?: string;
    groupId?: string;
  }) => void;
  removeTypingUser: (userId: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMedia: (isLoading: boolean) => void;
  setSelectedMedia: (
    media: Array<{
      uri: string;
      type: "IMAGE" | "VIDEO";
      width?: number;
      height?: number;
    }>,
  ) => void;
  handleTypingStatus: (isTyping: boolean) => void;
  sendTypingIndicator: (isTyping: boolean, socket: Socket) => void;
  setSelectedContact: (contact: User | null) => void;
  setSelectedGroup: (group: any | null) => void;
  setCurrentChatType: (type: "USER" | "GROUP" | null) => void;
  setCurrentChat: (chat: ChatState["currentChat"]) => void;

  // Async actions
  loadMessages: (chatId: string, pageNum?: number) => Promise<void>;
  sendMessage: (chatId: string, text: string, userId: string) => Promise<void>;
  sendMediaMessage: (
    chatId: string,
    text: string,
    userId: string,
    media: any[],
  ) => Promise<void>;
  handleReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
  handleUnReaction: (messageId: string) => Promise<void>;
  handleRecall: (messageId: string) => Promise<void>;
  handleDelete: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  refreshing: false,
  page: 1,
  hasMore: true,
  isLoadingMedia: false,
  selectedMedia: [],
  typingUsers: new Map(),
  isTyping: false,
  typingDebounceTimeout: null,
  currentChat: null,
  currentChatType: null,
  selectedContact: null,
  selectedGroup: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      // Kiểm tra xem message đã tồn tại chưa để tránh duplicate
      const messageExists = state.messages.some((msg) => msg.id === message.id);
      if (messageExists) {
        console.log("[chatStore] Message already exists, skipping:", message.id);
        return state; // Không thay đổi state nếu message đã tồn tại
      }
      return {
        messages: [...state.messages, message],
      };
    }),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg,
      ),
    })),
  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),
  setTypingUsers: (data) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(data.userId, {
        timestamp: data.timestamp,
        receiverId: data.receiverId,
        groupId: data.groupId,
      });
      return { typingUsers: newTypingUsers };
    });

    // Update user status store
    const { setUserStatus } = useUserStatusStore.getState();
    setUserStatus(data.userId, "typing", data.timestamp);
  },
  removeTypingUser: (userId) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.delete(userId);
      return { typingUsers: newTypingUsers };
    });

    // Update user status store back to online
    const { setUserStatus } = useUserStatusStore.getState();
    setUserStatus(userId, "online", new Date());
  },
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setPage: (page) => set({ page }),
  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoadingMedia: (isLoadingMedia) => set({ isLoadingMedia }),
  setSelectedMedia: (media) => set({ selectedMedia: media }),
  handleTypingStatus: (isTyping) => {
    const state = get();
    const currentChat =
      state.currentChatType === "USER"
        ? state.selectedContact
        : state.selectedGroup;

    if (!currentChat) return;

    // Clear existing timeout
    if (state.typingDebounceTimeout) {
      clearTimeout(state.typingDebounceTimeout);
    }

    // Get socket instance
    const socket = typeof window !== "undefined" ? window.messageSocket : null;
    if (!socket) {
      console.log(
        "[chatStore] Cannot send typing status: No socket connection",
      );
      return;
    }

    // Prepare data to send
    const data: { receiverId?: string; groupId?: string } = {};
    if (state.currentChatType === "USER") {
      // selectedContact has userId, not id
      const contact = currentChat as any;
      data.receiverId = contact.userId || contact.id;
    } else {
      // selectedGroup has id
      data.groupId = currentChat.id;
    }

    // Emit typing event when user is typing
    // Always emit "typing" when isTyping=true to refresh typing status on server
    // This ensures friend sees typing indicator continuously while user types
    if (isTyping) {
      // Always emit "typing" to refresh typing status
      socket.emit("typing", data);
      
      // Update local typing state if changed
      if (!state.isTyping) {
        set({ isTyping: true });
        
        // Update user status store
        const { setUserStatus } = useUserStatusStore.getState();
        const chatId = state.currentChatType === "USER" 
          ? (currentChat as any).userId || (currentChat as any).id
          : currentChat.id;
        setUserStatus(chatId, "typing", new Date());
      }
    } else {
      // Only emit stopTyping when state changes from typing to not typing
      if (state.isTyping) {
        socket.emit("stopTyping", data);
        
        set({ isTyping: false });

        // Update user status store
        const { setUserStatus } = useUserStatusStore.getState();
        const chatId = state.currentChatType === "USER" 
          ? (currentChat as any).userId || (currentChat as any).id
          : currentChat.id;
        setUserStatus(chatId, "online", new Date());
      }
    }

    // Set timeout to automatically stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      if (get().isTyping) {
        socket.emit("stopTyping", data);
        set({ isTyping: false });

        // Update user status store
        const { setUserStatus } = useUserStatusStore.getState();
        const chatId = state.currentChatType === "USER" 
          ? (currentChat as any).userId || (currentChat as any).id
          : currentChat.id;
        setUserStatus(chatId, "online", new Date());
      }
    }, 2000);

    set({ typingDebounceTimeout: timeout });
  },
  sendTypingIndicator: (isTyping: boolean, socket: Socket) => {
    const state = get();
    const { currentChat } = state;

    console.log("Current state:", {
      currentChat,
      currentChatType: state.currentChatType,
      selectedContact: state.selectedContact,
      selectedGroup: state.selectedGroup,
    });

    if (!currentChat) {
      console.log(
        "[chatStore] Cannot send typing indicator: No valid recipient",
      );
      return;
    }

    // Prepare data to send
    const data: { receiverId?: string; groupId?: string } = {};
    if (currentChat.type === "USER") {
      data.receiverId = currentChat.id;
      console.log(
        `[chatStore] Sending ${isTyping ? "typing" : "stopTyping"} event to user ${currentChat.id}`,
      );
    } else {
      data.groupId = currentChat.id;
      console.log(
        `[chatStore] Sending ${isTyping ? "typing" : "stopTyping"} event to group ${currentChat.id}`,
      );
    }

    // Emit the event
    const event = isTyping ? "typing" : "stopTyping";
    socket.emit(event, data);

    // Update local typing state
    set({ isTyping });

    // Update user status store
    const { setUserStatus } = useUserStatusStore.getState();
    // currentChat from state.currentChat has id field
    setUserStatus(currentChat.id, isTyping ? "typing" : "online", new Date());

    // Clear existing timeout if any
    if (state.typingDebounceTimeout) {
      clearTimeout(state.typingDebounceTimeout);
    }

    // Set new timeout to automatically stop typing after 2 seconds of inactivity
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (get().isTyping) {
          socket.emit("stopTyping", data);
          set({ isTyping: false });

          // Update user status store back to online
          setUserStatus(currentChat.id, "online", new Date());
        }
      }, 2000);

      set({ typingDebounceTimeout: timeout });
    }
  },
  setSelectedContact: (contact) =>
    set({
      selectedContact: contact,
      currentChatType: contact ? "USER" : null,
      selectedGroup: null, // Clear other selection
      currentChat: contact
        ? {
            id: contact.userId,
            name: contact.fullName,
            type: "USER",
            // Map other properties as needed
          }
        : null,
    }),

  setSelectedGroup: (group) =>
    set({
      selectedGroup: group,
      currentChatType: group ? "GROUP" : null,
      selectedContact: null, // Clear other selection
      currentChat: group
        ? {
            id: group.id,
            name: group.name,
            type: "GROUP",
            // Map other properties as needed
          }
        : null,
    }),

  setCurrentChatType: (type) => set({ currentChatType: type }),

  setCurrentChat: (chat) => set({ currentChat: chat }),

  // Async actions
  loadMessages: async (chatId, pageNum = 1) => {
    const state = get();
    try {
      state.setLoading(true);

      // Check if we have a valid chatId
      if (!chatId) {
        console.error("Cannot load messages: Invalid chat ID");
        state.setMessages([]);
        state.setLoading(false);
        return;
      }

      console.log(`Loading messages for chat ${chatId}, page ${pageNum}`);

      // Determine if this is a group chat or user chat
      const chatType = state.currentChatType;
      let data: Message[] = [];

      if (chatType === "GROUP") {
        data = await messageService.getGroupMessageHistory(chatId, pageNum);
      } else {
        data = await messageService.getMessageHistory(chatId, pageNum);
      }

      if (!data || data.length < 20) {
        state.setHasMore(false);
      }

      if (pageNum === 1) {
        state.setMessages(data?.reverse() || []);
      } else {
        state.setMessages([...(data?.reverse() || []), ...state.messages]);
      }

      state.setPage(pageNum);
      console.log(
        `Successfully loaded ${data?.length || 0} messages for chat ${chatId}`,
      );
    } catch (error) {
      console.error("Error loading messages:", error);
      // Trả về mảng rỗng để tránh crash app
      if (pageNum === 1) {
        state.setMessages([]);
      }
    } finally {
      state.setLoading(false);
    }
  },

  sendMessage: async (chatId, text) => {
    const state = get();
    try {
      // Determine if this is a group chat or user chat
      const chatType = state.currentChatType;

      if (chatType === "GROUP") {
        await messageService.sendGroupMessage({
          groupId: chatId,
          content: { text },
        });
      } else {
        await messageService.sendMessage({
          receiverId: chatId,
          content: { text },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  sendMediaMessage: async (chatId, text, userId, media) => {
    const state = get();
    const tempId = uuid.v4();

    try {
      state.setIsLoadingMedia(true);

      const formData = new FormData();

      // Determine if this is a group chat or user chat
      const chatType = state.currentChatType;

      if (chatType === "GROUP") {
        formData.append("groupId", chatId);
      } else {
        formData.append("receiverId", chatId);
      }

      formData.append("content[text]", text);

      media.forEach((m) => {
        let fileType;
        let fileName;

        if (m.type === "DOCUMENT") {
          fileType = m.mimeType || "application/octet-stream";
          fileName = m.name || `document_${Date.now()}`;
        } else if (m.type === "AUDIO") {
          fileType = "audio/m4p";
          fileName = `audio_${Date.now()}.m4a`;
        } else {
          fileType = m.type === "VIDEO" ? "video/mp4" : "image/jpeg";
          fileName = `${m.type.toLowerCase()}_${Date.now()}.${m.type === "VIDEO" ? "mp4" : "jpg"}`;
        }

        formData.append("files", {
          uri: m.uri,
          type: fileType,
          name: fileName,
          mediaType: m.type,
          // Include additional document metadata if available
          ...(m.type === "DOCUMENT" && {
            mimeType: m.mimeType,
            size: m.size,
          }),
        } as any);
      });
      console.log("formData", formData);
      let response;
      if (chatType === "GROUP") {
        response = await messageService.sendGroupMediaMessage(formData);
      } else {
        response = await messageService.sendMediaMessage(formData);
      }

      if (response) {
        state.updateMessage(tempId, { ...response, isMe: true });
      }
      state.setSelectedMedia([]);
    } catch (error) {
      console.error("Media upload error:", error);
      state.deleteMessage(tempId);
    } finally {
      state.setIsLoadingMedia(false);
    }
  },

  handleReaction: async (messageId, reaction) => {
    const state = get();
    try {
      await messageService.addReaction(messageId, reaction);

      // Tìm tin nhắn cần cập nhật
      const message = state.messages.find((m) => m.id === messageId);
      if (!message) return;

      // Lấy thông tin người dùng hiện tại từ authStore
      const currentUserId = message.isMe
        ? message.senderId
        : message.receiverId;

      // Kiểm tra xem người dùng đã thả reaction chưa
      const existingReactionIndex = message.reactions?.findIndex(
        (r) => r.userId === currentUserId,
      );

      let updatedReactions = [...(message.reactions || [])];

      if (existingReactionIndex !== undefined && existingReactionIndex >= 0) {
        // Nếu đã có reaction, cập nhật count và giữ nguyên loại reaction
        updatedReactions[existingReactionIndex] = {
          ...updatedReactions[existingReactionIndex],
          count: (updatedReactions[existingReactionIndex].count || 1) + 1,
        };
      } else {
        // Nếu chưa có reaction, thêm mới
        updatedReactions.push({
          userId: currentUserId,
          reaction,
          count: 1,
        });
      }

      // Cập nhật tin nhắn với reactions mới
      state.updateMessage(messageId, { reactions: updatedReactions });
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  },

  handleUnReaction: async (messageId) => {
    const state = get();
    try {
      await messageService.removeReaction(messageId);

      // Tìm tin nhắn cần cập nhật
      const message = state.messages.find((m) => m.id === messageId);
      if (!message) return;

      // Lấy thông tin người dùng hiện tại từ authStore
      const currentUserId = message.isMe
        ? message.senderId
        : message.receiverId;

      // Lọc bỏ reaction của người dùng hiện tại
      const updatedReactions =
        message.reactions?.filter((r) => r.userId !== currentUserId) || [];

      // Cập nhật tin nhắn với reactions mới
      state.updateMessage(messageId, { reactions: updatedReactions });
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  },

  handleRecall: async (messageId) => {
    const state = get();
    try {
      await messageService.recallMessage(messageId);
      state.updateMessage(messageId, { recalled: true });
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  },

  handleDelete: async (messageId) => {
    const state = get();
    try {
      await messageService.deleteMessage(messageId);
      state.deleteMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  },
}));
