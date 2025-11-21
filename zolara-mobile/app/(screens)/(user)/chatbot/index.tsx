import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Text,
  ListRenderItem,
} from "react-native";
import { Image as ImageIcon, Mic, SendHorizonal } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { Message } from "@/types";
import { ChatHeader } from "@/components/chat/chat.header";
import MessageBubble from "@/components/chat/message.bubble";

// AI Assistant ID - hardcoded
const AI_ASSISTANT_ID = "ai-assistant-001";
const AI_ASSISTANT_NAME = "AI Assistant";
const AI_ASSISTANT_AVATAR =
  "https://bpvhtgzjpccsngxhiugw.supabase.co/storage/v1/object/public/system/system/2507031a-c38d-4697-a0e5-cac96629fa99.png"; // LOGO SYSTEM ZOLARA IN CLOUD

const ChatbotScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();

  // Initialize with demo messages
  useEffect(() => {
    const demoMessages: Message[] = [
      {
        id: "msg-1",
        content: {
          text: "Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?",
        },
        senderId: AI_ASSISTANT_ID,
        receiverId: user?.userId || "",
        messageType: "USER",
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "msg-2",
        content: {
          text: "Xin chào! Bạn có thể giúp tôi tìm hiểu về ứng dụng này không?",
        },
        senderId: user?.userId || "",
        receiverId: AI_ASSISTANT_ID,
        messageType: "USER",
        createdAt: new Date(Date.now() - 30000).toISOString(),
      },
      {
        id: "msg-3",
        content: {
          text: "Tất nhiên rồi! Ứng dụng Zolara là một nền tảng nhắn tin và kết nối xã hội. Bạn có thể chat với bạn bè, tạo nhóm, và chia sẻ khoảnh khắc với mọi người.",
        },
        senderId: AI_ASSISTANT_ID,
        receiverId: user?.userId || "",
        messageType: "USER",
        createdAt: new Date(Date.now() - 10000).toISOString(),
      },
    ];
    setMessages(demoMessages);
    setTimeout(() => scrollToBottom(false), 100);
  }, [user?.userId]);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({
        index: 0,
        animated,
        viewPosition: 1,
      });
    }
  };

  // Simulate AI response
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("xin chào") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi")
    ) {
      return "Xin chào! Rất vui được trò chuyện với bạn. Bạn cần tôi giúp gì không?";
    }
    if (lowerMessage.includes("cảm ơn") || lowerMessage.includes("thanks")) {
      return "Không có gì! Tôi luôn sẵn sàng giúp đỡ bạn. Có điều gì khác bạn muốn biết không?";
    }
    if (lowerMessage.includes("tạm biệt") || lowerMessage.includes("bye")) {
      return "Tạm biệt! Chúc bạn một ngày tốt lành. Hẹn gặp lại!";
    }
    if (lowerMessage.includes("giúp") || lowerMessage.includes("help")) {
      return "Tôi có thể giúp bạn:\n- Trả lời câu hỏi\n- Hướng dẫn sử dụng ứng dụng\n- Cung cấp thông tin\n\nBạn muốn biết thêm về điều gì?";
    }
    if (lowerMessage.includes("ứng dụng") || lowerMessage.includes("app")) {
      return "Zolara là ứng dụng nhắn tin và mạng xã hội hiện đại. Bạn có thể:\n- Chat với bạn bè\n- Tạo và quản lý nhóm\n- Chia sẻ ảnh, video\n- Cập nhật trạng thái\n\nBạn muốn tìm hiểu thêm tính năng nào?";
    }

    // Default response
    return `Tôi hiểu bạn đang nói về "${userMessage}". Đây là một tính năng thú vị! Bạn có thể cho tôi biết thêm chi tiết không?`;
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: {
        text: message,
      },
      senderId: user.userId,
      receiverId: AI_ASSISTANT_ID,
      messageType: "USER",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setMessage("");
    setIsLoading(true);
    setTimeout(() => scrollToBottom(), 100);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        content: {
          text: generateAIResponse(message),
        },
        senderId: AI_ASSISTANT_ID,
        receiverId: user.userId,
        messageType: "USER",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [aiResponse, ...prev]);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }, 1000);
  };

  const renderItem: ListRenderItem<Message> = ({ item: msg, index }) => {
    const isLastMessageOfUser =
      index === messages.length - 1 ||
      messages[index + 1]?.senderId !== msg.senderId;

    return (
      <MessageBubble
        message={msg}
        profilePictureUrl={
          msg.senderId === AI_ASSISTANT_ID ? AI_ASSISTANT_AVATAR : undefined
        }
        senderName={undefined}
        isGroupChat={false}
        onReaction={() => {}}
        onRecall={() => {}}
        onDelete={() => {}}
        onUnReaction={() => {}}
        isLastMessageOfUser={isLastMessageOfUser}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ChatHeader
        user={AI_ASSISTANT_ID}
        chatId={AI_ASSISTANT_ID}
        name={AI_ASSISTANT_NAME}
        avatarUrl={AI_ASSISTANT_AVATAR}
        isGroup={false}
        isAIAssistant={true}
        onBack={() => router.back()}
      />
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        inverted={true}
        ListFooterComponent={
          isLoading ? (
            <View className="flex-row items-center justify-start mb-3">
              <View className="mr-2">
                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                  <Text className="text-xs">AI</Text>
                </View>
              </View>
              <View className="bg-white rounded-2xl p-2.5 px-4">
                <ActivityIndicator size="small" color={Colors.light.PRIMARY} />
              </View>
            </View>
          ) : null
        }
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={
          Platform.OS === "ios"
            ? { paddingBottom: 0 }
            : { paddingBottom: insets.bottom }
        }
      >
        <View
          className="flex-row justify-center items-center bg-white px-4 pt-2"
          style={{ paddingBottom: Platform.OS === "ios" ? 20 : 8 }}
        >
          <TextInput
            className="flex-1 ml-2.5 p-1 bg-transparent justify-center text-gray-700 text-base"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={message.length > 100 ? 4 : 1}
            textAlignVertical="center"
            style={{ minHeight: 40, maxHeight: 70 }}
          />
          {!message.trim() ? (
            <View className="flex-row relative">
              {/* <TouchableOpacity
                className="mx-2"
                onPress={() => {
                  // Voice input not implemented yet
                }}
              >
                <Mic size={26} color="#c4c4c4" strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity
                className="mx-2"
                onPress={() => {
                  // Media upload not implemented yet
                }}
              >
                <ImageIcon size={26} color="#c4c4c4" strokeWidth={1.5} />
              </TouchableOpacity> */}
            </View>
          ) : (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleSend}
                disabled={!message.trim() || isLoading}
              >
                <SendHorizonal
                  size={28}
                  color={Colors.light.PRIMARY}
                  fill={Colors.light.PRIMARY}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatbotScreen;
