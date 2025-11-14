import axiosInstance from "@/lib/axios";
import { Conversation } from "@/types";
import { messageService } from "./message-service";

export const conversationService = {
  // Lấy danh sách cuộc trò chuyện
  async getConversations(
    page: number = 1,
    limit: number = 20,
  ): Promise<
    { conversations: Conversation[]; totalCount: number } | undefined
  > {
    try {
      const response = await axiosInstance.get("/messages/conversations", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  // Đánh dấu một tin nhắn cụ thể là đã đọc
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await messageService.markAsRead(messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  },

  // Đánh dấu một tin nhắn cụ thể là chưa đọc
  async markMessageAsUnread(messageId: string): Promise<void> {
    try {
      await messageService.markAsUnread(messageId);
    } catch (error) {
      console.error("Error marking message as unread:", error);
      throw error;
    }
  },

  // Đánh dấu nhiều tin nhắn là đã đọc
  async markMultipleMessagesAsRead(messageIds: string[]): Promise<void> {
    try {
      // Sử dụng Promise.all để gọi đồng thời nhiều API call
      await Promise.all(messageIds.map((id) => messageService.markAsRead(id)));
    } catch (error) {
      console.error("Error marking multiple messages as read:", error);
      throw error;
    }
  },

  // Đánh dấu tất cả tin nhắn đã đọc cho một cuộc hội thoại
  async markAllMessagesAsRead(
    type: "USER" | "GROUP",
    targetId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axiosInstance.post(
        `/messages/read-all/${type}/${targetId}`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
};
