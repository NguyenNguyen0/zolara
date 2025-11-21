import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Avatar from "@/components/customize/ui/avatar";
import AgentIcon from "@/components/customize/ui/agent.icon";
import Markdown from "react-native-markdown-display";
import { formatMessageTime } from "@/utils/convertHelper";
import { APP_COLOR } from "@/utils/constants";

// Safe markdown renderer with error boundary
const SafeMarkdownRenderer: React.FC<{
  content: string;
  isStreaming?: boolean;
  markdownStyles: any;
}> = React.memo(({ content, isStreaming, markdownStyles }) => {
  // Memoize the fallback text style to prevent re-renders
  const fallbackStyle = useMemo(
    () => ({
      color: "#6B7280",
      fontSize: 15,
      lineHeight: 20,
    }),
    []
  );

  try {
    // Validate content before rendering
    if (!content || typeof content !== "string") {
      return (
        <Text style={fallbackStyle}>
          {content || ""}
          {isStreaming && (
            <ActivityIndicator size="large" color={APP_COLOR.PRIMARY} />
          )}
        </Text>
      );
    }

    // Sanitize content - remove potentially problematic markdown
    const sanitizedContent = content
      .replace(/<!--[^>]*-->/g, "") // Remove HTML comments
      .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
      .replace(/<style[^>]*>.*?<\/style>/gi, "") // Remove styles
      .replace(/<[^>]+>/g, "") // Remove HTML tags
      .replace(/\r\n/g, "\n") // Normalize line endings
      .trim();

    if (!sanitizedContent) {
      return (
        <Text style={fallbackStyle}>
          {/* Empty message */}
          {isStreaming && (
            <ActivityIndicator size="large" color={APP_COLOR.PRIMARY} />
          )}
        </Text>
      );
    }

    return <Markdown style={markdownStyles}>{sanitizedContent}</Markdown>;
  } catch (error) {
    console.warn("Markdown rendering error:", error);
    return <Text style={fallbackStyle}>{content || "Lỗi hiển thị tin nhắn"}</Text>;
  }
});

SafeMarkdownRenderer.displayName = "SafeMarkdownRenderer";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isAgent?: boolean;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  timestamp: string; // ISO string for consistency with Redux state
  type?: "text" | "image" | "sticker";
  isStreaming?: boolean;
  error?: string;
}

interface ChatbotMessageItemProps {
  message: Message;
  user: User;
  isMe: boolean;
  isGroup: boolean;
  showAvatar: boolean;
  showTime: boolean;
  onRetry?: () => void;
}

export default function ChatbotMessageItem({
  message,
  user,
  isMe,
  isGroup,
  showAvatar,
  showTime,
  onRetry,
}: ChatbotMessageItemProps) {
  // Memoize dynamic colors for markdown to prevent recreation on every render
  const markdownStyles = useMemo(
    () => ({
      body: {
        fontSize: 15,
        lineHeight: 20,
        color: "#1F2937",
      },
      code_inline: {
        backgroundColor: "#F3F4F6",
        color: "#1F2937",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: "monospace",
      },
      fence: {
        backgroundColor: "#F8FAFC",
        color: "#374151",
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontFamily: "monospace",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
      heading1: {
        fontSize: 20,
        fontWeight: "bold" as const,
        marginVertical: 8,
        color: "#1F2937",
      },
      heading2: {
        fontSize: 18,
        fontWeight: "bold" as const,
        marginVertical: 6,
        color: "#1F2937",
      },
      heading3: {
        fontSize: 16,
        fontWeight: "bold" as const,
        marginVertical: 4,
        color: "#1F2937",
      },
      strong: {
        fontWeight: "bold" as const,
        color: "#1F2937",
      },
      em: {
        fontStyle: "italic" as const,
        color: "#1F2937",
      },
      list_item: {
        marginVertical: 2,
        color: "#1F2937",
      },
      bullet_list: {
        marginVertical: 4,
      },
      ordered_list: {
        marginVertical: 4,
      },
      paragraph: {
        color: "#1F2937",
        marginVertical: 2,
      },
    }),
    []
  );

  // Early return if required props are missing (after all hooks)
  if (!message || !user) {
    return null;
  }

  const time = formatMessageTime(
    new Date(message.timestamp || new Date().toISOString())
  );

  const bubbleStyle = isMe
    ? "bg-gray-100 rounded-2xl rounded-tr-md"
    : "bg-gray-100 rounded-2xl rounded-tl-md";

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  };

  return (
    <View className={`mb-3 px-4 ${isMe ? "items-end" : "items-start"}`}>
      {/* Avatar - positioned above message for agents */}
      {!isMe && showAvatar && (
        <View className="mb-2 flex-row items-center">
          {user.isAgent ? (
            <>
              <AgentIcon size={32} />
              <Text className="ml-2 text-sm font-medium text-gray-600">
                Trợ lý AI
              </Text>
            </>
          ) : (
            <>
              <Avatar uri={user.avatar} />
              {isGroup && user?.name && (
                <Text className="ml-2 text-sm font-medium text-[#FF6B6B]">
                  {user.name}
                </Text>
              )}
            </>
          )}
        </View>
      )}

      <View className={`max-w-[90%] ${isMe ? "items-end" : "items-start"}`}>
        {/* Message bubble */}
        <View className={`px-4 py-3 ${bubbleStyle}`} style={shadowStyle}>
          {/* Message content */}
              {message?.error ? (
            <View>
              <Text className="text-[15px] leading-5 text-red-500">
                ❌ {message.error}
              </Text>
              {onRetry && (
                <TouchableOpacity onPress={onRetry} className="mt-1">
                  <Text className="text-blue-500 text-sm">
                    Thử lại
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              {user?.isAgent ? (
                <SafeMarkdownRenderer
                  content={message.content || ""}
                  isStreaming={message.isStreaming}
                  markdownStyles={markdownStyles}
                />
              ) : (
                <Text className="text-[15px] leading-5 text-gray-900">
                  {message.content || ""}
                </Text>
              )}
            </View>
          )}

          {/* Timestamp */}
          {showTime && (
            <Text
              className="text-[10px] text-gray-500 mt-1"
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
              }}
            >
              {time}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
