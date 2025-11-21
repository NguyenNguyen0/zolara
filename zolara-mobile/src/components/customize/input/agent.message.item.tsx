import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Avatar from "../ui/avatar";
import AgentIcon from "../ui/agent.icon";
import { formatMessageTime } from "@/utils/convertHelper";
import { APP_COLOR } from "@/utils/constants";
import { AgentMessage } from "@/services/agent-service";

// Simple translation function
const t = (key: string): string => {
  const translations: Record<string, string> = {
    "messages.error": "Lỗi tin nhắn",
    "messages.retry": "Thử lại",
    "status": "AI Assistant",
  };
  return translations[key] || key;
};

// Safe markdown renderer with error boundary
const SafeMarkdownRenderer: React.FC<{
  content: string;
  isStreaming?: boolean;
  isDark: boolean;
  markdownStyles: any;
}> = React.memo(({ content, isStreaming, isDark, markdownStyles }) => {
  // Memoize the fallback text style to prevent re-renders
  const fallbackStyle = useMemo(
    () => ({
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontSize: 15,
      lineHeight: 20,
    }),
    [isDark],
  );

  try {
    // Validate content before rendering
    if (!content || typeof content !== "string") {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={fallbackStyle}>
            {content || ""}
          </Text>
          {isStreaming && (
            <ActivityIndicator size={4} color={APP_COLOR.PRIMARY} style={{ marginLeft: 8 }} />
          )}
        </View>
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={fallbackStyle}>
            {/* Empty message */}
          </Text>
          {isStreaming && (
            <ActivityIndicator size="small" color={APP_COLOR.PRIMARY} style={{ marginLeft: 8 }} />
          )}
        </View>
      );
    }

    return (
      <View>
        <Markdown style={markdownStyles}>{sanitizedContent}</Markdown>
        {isStreaming && (
          <ActivityIndicator size="small" color={APP_COLOR.PRIMARY} style={{ marginTop: 8 }} />
        )}
      </View>
    );
  } catch (error) {
    console.warn("Markdown rendering error:", error);
    return <Text style={fallbackStyle}>{content || t("messages.error")}</Text>;
  }
});

SafeMarkdownRenderer.displayName = "SafeMarkdownRenderer";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isAgent?: boolean;
}

interface ChatbotMessageItemProps {
  message: AgentMessage;
  user: User;
  isMe: boolean;
  isGroup: boolean;
  showAvatar: boolean;
  showTime: boolean;
  onRetry?: () => void;
}

export default function AgentMessageItem({
  message,
  user,
  isMe,
  isGroup,
  showAvatar,
  showTime,
  onRetry,
}: ChatbotMessageItemProps) {
  // Safely handle color scheme changes
  const colorScheme = useColorScheme();
  const isDark = useMemo(() => colorScheme === "dark", [colorScheme]);

  // Memoize dynamic colors for markdown to prevent recreation on every render
  const markdownStyles = useMemo(
    () => ({
      body: {
        fontSize: 15,
        lineHeight: 20,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      code_inline: {
        backgroundColor: isDark ? "#374151" : "#F3F4F6",
        color: isDark ? "#E5E7EB" : "#1F2937",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: "monospace",
      },
      fence: {
        backgroundColor: isDark ? "#1F2937" : "#F8FAFC",
        color: isDark ? "#E5E7EB" : "#374151",
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontFamily: "monospace",
        borderWidth: 1,
        borderColor: isDark ? "#4B5563" : "#E5E7EB",
      },
      heading1: {
        fontSize: 20,
        fontWeight: "bold" as const,
        marginVertical: 8,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      heading2: {
        fontSize: 18,
        fontWeight: "bold" as const,
        marginVertical: 6,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      heading3: {
        fontSize: 16,
        fontWeight: "bold" as const,
        marginVertical: 4,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      strong: {
        fontWeight: "bold" as const,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      em: {
        fontStyle: "italic" as const,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      list_item: {
        marginVertical: 2,
        color: isDark ? "#F9FAFB" : "#1F2937",
      },
      bullet_list: {
        marginVertical: 4,
      },
      ordered_list: {
        marginVertical: 4,
      },
      paragraph: {
        color: isDark ? "#F9FAFB" : "#1F2937",
        marginVertical: 2,
      },
    }),
    [isDark],
  );

  // Early return if required props are missing (after all hooks)
  if (!message || !user) {
    return null;
  }

  const time = formatMessageTime(
    new Date(message.timestamp || new Date().toISOString()),
  );

  const bubbleStyle = isMe
    ? "bg-light-mode dark:bg-secondary-dark rounded-2xl rounded-tr-md"
    : "bg-light-mode dark:bg-secondary-dark rounded-2xl rounded-tl-md";

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
              <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("status")}
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
                    {t("messages.retry")}
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
                  isDark={isDark}
                  markdownStyles={markdownStyles}
                />
              ) : (
                <Text className="text-[15px] leading-5 text-dark-mode dark:text-light-mode">
                  {message.content || ""}
                </Text>
              )}
            </View>
          )}

          {/* Timestamp */}
          {showTime && (
            <Text
              className="text-[10px] text-gray-500 dark:text-secondary-light mt-1"
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
