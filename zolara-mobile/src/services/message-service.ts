import axiosInstance from "@/lib/axios";
import {
  Message,
  ReactionType,
  SendMessageRequest,
  SendGroupMessageRequest,
} from "@/types";

interface ForwardMessageRequest {
  messageId: string;
  targets: Array<{
    userId?: string;
    groupId?: string;
  }>;
}

const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);

  // Check if it's a network error
  if (
    error.name === "NetworkError" ||
    (error.message && error.message.includes("Network")) ||
    (error.code && error.code === "ECONNABORTED")
  ) {
    // Return empty data instead of throwing for network errors
    console.log(`Network error in ${context}, returning empty data`);
    return [];
  }

  throw error;
};

export const messageService = {
  // Gửi tin nhắn văn bản đến người dùng
  async sendMessage(data: SendMessageRequest): Promise<Message | undefined> {
    try {
      const response = await axiosInstance.post("/messages/user", data);
      return response.data;
    } catch (error) {
      handleError(error, "sendMessage");
    }
  },

  // Gửi tin nhắn văn bản đến nhóm
  async sendGroupMessage(
    data: SendGroupMessageRequest,
  ): Promise<Message | undefined> {
    try {
      const response = await axiosInstance.post("/messages/group", data);
      return response.data;
    } catch (error) {
      handleError(error, "sendGroupMessage");
    }
  },

  // Lấy lịch sử tin nhắn người dùng
  async getMessageHistory(
    receiverId: string,
    page: number = 1,
    limit: number = 20,
    retryCount = 0,
  ): Promise<Message[]> {
    try {
      console.log(
        `Fetching message history for receiver ${receiverId}, page ${page}`,
      );
      const response = await axiosInstance.get(`/messages/user/${receiverId}`, {
        params: { page, limit },
        timeout: 30000, // Tăng thời gian chờ lên 30 giây
      });

      return response.data || [];
    } catch (error: any) {
      // Check if it's a network error and we should retry
      if (
        retryCount < 2 &&
        (error.name === "NetworkError" ||
          (error.message && error.message.includes("Network")) ||
          (error.code && error.code === "ECONNABORTED"))
      ) {
        console.log(`Network error, retrying (${retryCount + 1}/2)...`);
        // Wait for a short time before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.getMessageHistory(receiverId, page, limit, retryCount + 1);
      }

      // If we've exhausted retries or it's not a network error
      console.error(
        `Error in getMessageHistory (attempt ${retryCount + 1})`,
        error,
      );
      // Trả về mảng rỗng thay vì undefined để tránh crash app
      return [];
    }
  },

  // Lấy lịch sử tin nhắn nhóm
  async getGroupMessageHistory(
    groupId: string,
    page: number = 1,
    limit: number = 20,
    retryCount = 0,
  ): Promise<Message[]> {
    try {
      console.log(
        `Fetching group message history for group ${groupId}, page ${page}`,
      );
      const response = await axiosInstance.get(`/messages/group/${groupId}`, {
        params: { page, limit },
        timeout: 30000, // Tăng thời gian chờ lên 30 giây
      });

      return response.data || [];
    } catch (error: any) {
      // Check if it's a network error and we should retry
      if (
        retryCount < 2 &&
        (error.name === "NetworkError" ||
          (error.message && error.message.includes("Network")) ||
          (error.code && error.code === "ECONNABORTED"))
      ) {
        console.log(`Network error, retrying (${retryCount + 1}/2)...`);
        // Wait for a short time before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.getGroupMessageHistory(
          groupId,
          page,
          limit,
          retryCount + 1,
        );
      }

      // If we've exhausted retries or it's not a network error
      console.error(
        `Error in getGroupMessageHistory (attempt ${retryCount + 1})`,
        error,
      );
      // Trả về mảng rỗng thay vì undefined để tránh crash app
      return [];
    }
  },

  // Tìm kiếm tin nhắn người dùng
  async searchMessages(
    receiverId: string,
    query: string,
    page: number = 1,
  ): Promise<Message[] | undefined> {
    try {
      const response = await axiosInstance.get(
        `/messages/user/${receiverId}/search`,
        {
          params: { query, page },
        },
      );
      return response.data;
    } catch (error) {
      handleError(error, "searchMessages");
    }
  },

  // Tìm kiếm tin nhắn nhóm
  async searchGroupMessages(
    groupId: string,
    query: string,
    page: number = 1,
  ): Promise<Message[] | undefined> {
    try {
      const response = await axiosInstance.get(
        `/messages/group/${groupId}/search`,
        {
          params: { query, page },
        },
      );
      return response.data;
    } catch (error) {
      handleError(error, "searchGroupMessages");
    }
  },

  // Đánh dấu đã đọc
  async markAsRead(messageId: string): Promise<void> {
    try {
      await axiosInstance.patch(`/messages/read/${messageId}`);
    } catch (error) {
      handleError(error, "markAsRead");
    }
  },

  async markAsUnread(messageId: string): Promise<void> {
    try {
      await axiosInstance.patch(`/messages/unread/${messageId}`);
    } catch (error) {
      handleError(error, "markAsUnread");
    }
  },

  // Thêm reaction
  async addReaction(
    messageId: string,
    reactionType: ReactionType,
  ): Promise<void> {
    try {
      await axiosInstance.post(`/messages/reaction`, {
        messageId,
        reaction: reactionType,
      });
    } catch (error) {
      handleError(error, "addReaction");
    }
  },

  // Xóa reaction
  async removeReaction(messageId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/messages/reaction/${messageId}`);
    } catch (error) {
      handleError(error, "removeReaction");
    }
  },

  // Thu hồi tin nhắn
  async recallMessage(messageId: string): Promise<void> {
    try {
      await axiosInstance.patch(`/messages/recall/${messageId}`);
    } catch (error) {
      handleError(error, "recallMessage");
    }
  },

  // Chuyển tiếp tin nhắn
  async forwardMessage(data: ForwardMessageRequest): Promise<void> {
    try {
      await axiosInstance.post("/messages/forward", {
        messageId: data.messageId,
        targets: data.targets, // Đảm bảo gửi đúng tên field là 'targets'
      });
    } catch (error) {
      handleError(error, "forwardMessage");
    }
  },

  // Xóa tin nhắn (phía người dùng)
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/messages/deleted-self-side/${messageId}`);
    } catch (error) {
      handleError(error, "deleteMessage");
    }
  },

  async sendMediaMessage(formData: FormData): Promise<Message | undefined> {
    try {
      const response = await axiosInstance.post("/messages/user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Senmediamessage", response.data); // In dữ liệu phản hồi để kiểm tra nội dung và trạng thái
      return response.data;
    } catch (error) {
      handleError(error, "sendMediaMessage");
    }
  },

  // Gửi tin nhắn media đến nhóm
  async sendGroupMediaMessage(
    formData: FormData,
  ): Promise<Message | undefined> {
    try {
      const response = await axiosInstance.post("/messages/group", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      handleError(error, "sendGroupMediaMessage");
    }
  },
};
