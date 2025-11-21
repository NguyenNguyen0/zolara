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
import { useChatbotStore } from "@/store/agentStore";
import { ChatHeader } from "@/components/chat/chat.header";
import AgentMessageItem from "@/components/customize/input/agent.message.item";
import ChatbotIntro from "../../../../src/components/customize/input/chatbot.intro";

// AI Assistant ID - hardcoded
const AI_ASSISTANT_ID = "ai-assistant-001";
const AI_ASSISTANT_NAME = "Zolara Assistant";
const AI_ASSISTANT_AVATAR =
  "https://bpvhtgzjpccsngxhiugw.supabase.co/storage/v1/object/public/system/system/2507031a-c38d-4697-a0e5-cac96629fa99.png"; // LOGO SYSTEM ZOLARA IN CLOUD

const ChatbotScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Use the agent store
  const {
    messages,
    isConnected,
    isTyping,
    error,
    connect,
    disconnect,
    sendMessage: sendAgentMessage,
    clearMessages,
    setError,
  } = useChatbotStore();

  // Connect to agent service on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [messages]);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({ animated });
        } catch (error) {
          console.warn("Error scrolling to bottom:", error);
        }
      }, 100);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !isConnected) return;

    const messageText = message;
    setMessage("");
    
    try {
      await sendAgentMessage(messageText);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    }
  };

  const renderItem = ({ item: msg, index }: { item: any; index: number }) => {
    const isMe = msg.userId === user?.userId;
    const isAgent = msg.userId === "agent";
    const isLastMessageOfUser =
      index === messages.length - 1 ||
      messages[index + 1]?.userId !== msg.userId;

    return (
      <AgentMessageItem
        message={msg}
        user={{
          id: isAgent ? AI_ASSISTANT_ID : msg.userId,
          name: isAgent ? AI_ASSISTANT_NAME : user?.fullName || "User",
          avatar: isAgent ? AI_ASSISTANT_AVATAR : undefined,
          isAgent: isAgent,
        }}
        isMe={isMe}
        isGroup={false}
        showAvatar={!isMe && isLastMessageOfUser}
        showTime={true}
        onRetry={() => {
          if (error) {
            setError(null);
          }
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ChatHeader
        user={AI_ASSISTANT_ID}
        chatId={AI_ASSISTANT_ID}
        name={`${AI_ASSISTANT_NAME}${isConnected ? '' : ' (Offline)'}`}
        avatarUrl={AI_ASSISTANT_AVATAR}
        isGroup={false}
        isAIAssistant={true}
        onBack={() => router.back()}
      />
      
      {/* Connection status and error display */}
      {!isConnected && (
        <View className="bg-yellow-100 px-4 py-2 border-b border-yellow-200">
          <Text className="text-yellow-800 text-sm text-center">
            ⚠️ Đang kết nối lại với AI Assistant...
          </Text>
        </View>
      )}
      
      {error && (
        <View className="bg-red-100 px-4 py-2 border-b border-red-200">
          <Text className="text-red-800 text-sm text-center">
            ❌ {error}
          </Text>
          <TouchableOpacity 
            onPress={() => setError(null)}
            className="mt-1"
          >
            <Text className="text-red-600 text-xs text-center underline">
              Ẩn thông báo
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View className="flex-1">
        {messages.length === 0 ? (
          <ChatbotIntro 
            assistantName={AI_ASSISTANT_NAME}
            assistantAvatar={AI_ASSISTANT_AVATAR}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages} // Use messages in original order (newest at end)
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>
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
          {/* Clear messages button */}
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={clearMessages}
              className="mr-2 p-2"
              disabled={isTyping}
            >
              <Text className="text-xs text-gray-500">Clear</Text>
            </TouchableOpacity>
          )}
          
          <TextInput
            className="flex-1 ml-2.5 p-1 bg-transparent justify-center text-gray-700 text-base"
            placeholder={
              isConnected 
                ? "Nhập tin nhắn..." 
                : "Đang kết nối..."
            }
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={message.length > 100 ? 4 : 1}
            textAlignVertical="center"
            style={{ minHeight: 40, maxHeight: 70 }}
            editable={isConnected && !isTyping}
            onSubmitEditing={() => {
              if (message.trim() && isConnected && !isTyping) {
                handleSend();
              }
            }}
          />
          
          {message.trim() && (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleSend}
                disabled={!message.trim() || isTyping || !isConnected}
                className="ml-2 p-2"
              >
                <SendHorizonal
                  size={28}
                  color={
                    !message.trim() || isTyping || !isConnected 
                      ? "#c4c4c4" 
                      : Colors.light.PRIMARY
                  }
                  fill={
                    !message.trim() || isTyping || !isConnected 
                      ? "#c4c4c4" 
                      : Colors.light.PRIMARY
                  }
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
