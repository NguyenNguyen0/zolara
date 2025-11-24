import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useConversationsStore } from "@/store/conversationsStore";
import ConversationList from "./ConversationList";
import { Conversation, Message } from "@/types";
import { useRouter } from "expo-router";
import { useSocket } from "@/providers/SocketProvider";
import { useAuthStore } from "@/store/authStore";

const HomeConversations: React.FC = () => {
  const router = useRouter();
  const { messageSocket } = useSocket();
  const currentUser = useAuthStore((state) => state.user);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const {
    conversations,
    loading,
    error,
    hasMore,
    currentPage,
    fetchConversations,
    markAsRead,
    markMessageAsRead,
    updateConversation,
  } = useConversationsStore();

  // Lọc cuộc trò chuyện để chỉ hiển thị với bạn bè và nhóm
  useEffect(() => {
    const filtered = conversations.filter((conversation) => {
      // Luôn hiển thị tất cả cuộc trò chuyện
      return true;
    });

    setFilteredConversations(filtered);
  }, [conversations]);

  // Tải danh sách cuộc trò chuyện khi component được mount
  useEffect(() => {
    fetchConversations(1);
  }, []);

  // Lắng nghe sự kiện socket cho tin nhắn mới và cập nhật cuộc trò chuyện
  useEffect(() => {
    if (!messageSocket || !currentUser) return;

    // Xử lý tin nhắn mới
    const handleNewMessage = (data: {
      message: Message;
      type: "user" | "group";
      timestamp: string;
    }) => {
      const { message } = data;
      const isGroup = message.messageType === "GROUP";
      const conversationId = isGroup
        ? message.groupId
        : message.senderId === currentUser.userId
          ? message.receiverId
          : message.senderId;

      // Tìm cuộc trò chuyện hiện có
      const existingConversation = conversations.find((conv) => {
        if (conv.type === "USER" && !isGroup) {
          return conv.user?.id === conversationId;
        } else if (conv.type === "GROUP" && isGroup) {
          return conv.group?.id === conversationId;
        }
        return false;
      });

      if (existingConversation) {
        // Cập nhật cuộc trò chuyện hiện có
        const isFromCurrentUser = message.senderId === currentUser.userId;
        updateConversation(existingConversation.id, {
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt || new Date().toISOString(),
          },
          updatedAt: message.createdAt || new Date().toISOString(),
          unreadCount: isFromCurrentUser
            ? existingConversation.unreadCount
            : existingConversation.unreadCount + 1,
        });
      } else {
        // Nếu không tìm thấy cuộc trò chuyện, tải lại danh sách
        fetchConversations(1);
      }
    };

    // Lắng nghe sự kiện tin nhắn mới
    messageSocket.on("newMessage", handleNewMessage);

    // Lắng nghe sự kiện đánh dấu đã đọc - đã bỏ logic này

    // Cleanup khi component unmount
    return () => {
      messageSocket.off("newMessage", handleNewMessage);
      messageSocket.off("messageRead");
    };
  }, [messageSocket, currentUser, conversations]);

  // Xử lý khi người dùng nhấn vào một cuộc trò chuyện
  const handleConversationPress = (conversation: Conversation) => {
    const isUser = conversation.type === "USER";
    const id = isUser ? conversation.user?.id : conversation.group?.id;
    const name = isUser
      ? conversation.user?.fullName
      : conversation.group?.name;
    const avatarUrl = isUser
      ? conversation.user?.profilePictureUrl
      : conversation.group?.avatarUrl;

    if (id) {
      // Đánh dấu đã đọc nếu có tin nhắn chưa đọc
      if (conversation.unreadCount > 0) {
        // Đánh dấu toàn bộ cuộc trò chuyện là đã đọc
        markAsRead(id, conversation.type);

        // Nếu có tin nhắn cuối cùng, đánh dấu nó là đã đọc
        if (conversation.lastMessage?.id) {
          markMessageAsRead(conversation.lastMessage.id, id, conversation.type);
        }
      }

      // Chuyển đến màn hình chat
      router.push({
        pathname: `../chat/${id}`,
        params: {
          name,
          avatarUrl,
          type: conversation.type,
        },
      });
    }
  };

  // Xử lý khi người dùng kéo xuống để tải thêm
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchConversations(currentPage + 1);
    }
  };

  // Xử lý khi người dùng kéo xuống để làm mới
  const handleRefresh = () => {
    fetchConversations(1);
  };

  return (
    <View className="flex-1">
      <ConversationList
        conversations={filteredConversations}
        onConversationPress={handleConversationPress}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        refreshing={loading && currentPage === 1}
        onEndReached={handleLoadMore}
      />
    </View>
  );
};

export default HomeConversations;
