import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text as RNText,
  Alert,
  Pressable,
  Clipboard,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Heart,
  Forward,
  HeartOff,
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { ImageViewer } from "@/components/chat/image.viewer";
import { VideoMessage } from "@/components/chat/video.message";
import { DocumentPreview } from "@/components/chat/document.preview";
import AudioMessage from "@/components/chat/audio.message";
import { Message, ReactionType } from "@/types";
import clsx from "clsx";
import { MediaGrid } from "@/components/chat/media.grid";
import { HStack } from "../ui/hstack";
import { MessageActions } from "./message.actions";
import { MessageForwardModal } from "./message.forward.modal";
import { Colors } from "@/constants/Colors";

interface MessageBubbleProps {
  message: Message;
  profilePictureUrl?: string;
  senderName?: string;
  isGroupChat?: boolean;
  onReaction: (messageId: string, type: ReactionType) => void;
  onRecall: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onUnReaction: (messageId: string) => void;
  isLastMessageOfUser: boolean;
}

interface ReactionOption {
  type: ReactionType;
  emoji: string;
}

const reactionOptions: ReactionOption[] = [
  { type: "LIKE", emoji: "👍" },
  { type: "LOVE", emoji: "💖" },
  { type: "HAHA", emoji: "😂" },
  { type: "WOW", emoji: "😲" },
  { type: "SAD", emoji: "😥" },
  { type: "ANGRY", emoji: "😡" },
];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  profilePictureUrl,
  senderName,
  isGroupChat = false,
  onReaction,
  onRecall,
  onDelete,
  onUnReaction,
  isLastMessageOfUser,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLongPressReaction, setShowLongPressReaction] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const { user } = useAuthStore();
  const isMyMessage = message.senderId === user?.userId;
  const mediaItems = message.content.media || [];

  // Check if message should be hidden (deleted for current user)
  if (message.deletedBy?.includes(user?.userId || "")) {
    return null;
  }

  // Kiểm tra xem người dùng hiện tại đã thả reaction cho tin nhắn này chưa
  const userReaction = useMemo(() => {
    if (!message.reactions) return null;
    return message.reactions.find((r) => r.userId === user?.userId) || null;
  }, [message.reactions, user?.userId]);

  const hasReacted = !!userReaction;
  const hasReactions = message.reactions && message.reactions.length > 0;
  const shouldShowReactionButton =
    isLastMessageOfUser || hasReactions || showLongPressReaction;

  // Reactions are already grouped by type with count in the new data structure
  const groupedReactions = useMemo(() => {
    if (!message.reactions) return [];

    // Map the reactions to the format expected by the UI
    return message.reactions.map((reaction) => ({
      type: reaction.reaction as ReactionType,
      count: reaction.count || 1,
      userId: reaction.userId,
    }));
  }, [message.reactions]);

  // Render media content (images, videos, documents)
  const renderMediaContent = () => {
    if (mediaItems.length === 0) return null;

    return (
      <>
        {/* Render images */}
        <MediaGrid
          mediaItems={mediaItems}
          onImagePress={(index) => {
            setSelectedImageIndex(index);
            setShowImageViewer(true);
          }}
        />

        {/* Render videos */}
        {mediaItems
          .filter((media) => media.type === "VIDEO")
          .map((media, index) => (
            <VideoMessage key={`video-${index}`} url={media.url} />
          ))}

        {/* Render documents */}
        {mediaItems
          .filter((media) => media.type === "DOCUMENT")
          .map((media, index) => (
            <DocumentPreview
              key={`doc-${index}`}
              url={media.url}
              fileName={media.fileName || ""}
            />
          ))}

        {/* Render audio messages */}
        {mediaItems
          .filter((media) => media.type === "AUDIO")
          .map((media, index) => (
            <AudioMessage key={`audio-${index}`} url={media.url} />
          ))}
      </>
    );
  };

  const handleRecall = () => {
    Alert.alert(
      "Thu hồi tin nhắn",
      "Bạn có chắc chắn muốn thu hồi tin nhắn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thu hồi",
          style: "destructive",
          onPress: () => onRecall(message.id),
        },
      ],
    );
  };
  const handleUnReaction = () => {
    onUnReaction(message.id);
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa tin nhắn",
      "Bạn có chắc chắn muốn xóa tin nhắn này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => onDelete(message.id),
        },
      ],
    );
  };

  const handleLongPress = () => {
    if (message.recalled) return;
    setShowActions(true);
  };

  const handleForward = () => {
    setShowActions(false);
    setShowForwardModal(true);
  };

  const handleCloseActions = () => {
    setShowActions(false);
  };

  const handleCloseReactionPicker = () => {
    setShowReactionPicker(false);
    setShowLongPressReaction(false);
  };

  // Đóng reaction picker sau khi đã chọn reaction
  const handleReactionSelect = (type: ReactionType) => {
    onReaction(message.id, type);
    setShowReactionPicker(false);
    setShowLongPressReaction(false);
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    // Handle different types of content
    if (message.content && message.content.text) {
      Clipboard.setString(message.content.text);
      Alert.alert("Thông báo", "Đã sao chép tin nhắn");
    } else if (message.content && typeof message.content === "string") {
      Clipboard.setString(message.content);
      Alert.alert("Thông báo", "Đã sao chép tin nhắn");
    }
  };

  return (
    <>
      <View
        className={clsx(
          "flex-row mb-3 w-full relative",
          isMyMessage ? "justify-end" : "justify-start",
          shouldShowReactionButton ? "mb-6" : "mb-0.5",
        )}
      >
        {!isMyMessage && (
          <View className="mr-2">
            <Avatar size="sm">
              <AvatarImage source={{ uri: profilePictureUrl }} />
              {!profilePictureUrl && (
                <AvatarFallbackText>
                  {message.senderId.slice(0, 2).toUpperCase()}
                </AvatarFallbackText>
              )}
            </Avatar>
          </View>
        )}

        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          className={clsx(
            "rounded-2xl max-w-[80%] relative",
            isMyMessage ? "" : "bg-white",
          )}
          style={
            isMyMessage
              ? { 
                  backgroundColor: Colors.light.MESSAGE_BUBBLE_BG,
                  shadowColor: Colors.light.PRIMARY,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 3,
                }
              : {
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.08,
                  shadowRadius: 3,
                  elevation: 2,
                }
          }
        >
          <View className="p-2.5 px-4">
            {message.recalled ? (
              <RNText className="text-typography-500 italic">
                Tin nhắn đã thu hồi
              </RNText>
            ) : (
              <>
                {/* Forwarded message indicator */}
                {message.forwardedFrom && (
                  <View className="flex-row items-center mb-1">
                    <Forward size={14} color="#6B7280" />
                    <RNText className="text-xs text-gray-500 ml-1">
                      Tin nhắn được chuyển tiếp
                    </RNText>
                  </View>
                )}

                {/* Sender name for group chats */}
                {!isMyMessage && isGroupChat && senderName && (
                  <RNText
                    className="text-xs font-medium mb-1"
                    style={{ color: Colors.light.MESSAGE_BUBBLE_TEXT }}
                  >
                    {senderName}
                  </RNText>
                )}

                {/* Text content */}
                {message.content.text && (
                  <RNText
                    className={clsx(
                      "text-base",
                      isMyMessage ? "text-gray-700" : "text-typography-900",
                    )}
                  >
                    {message.content.text}
                  </RNText>
                )}

                {/* Media content */}
                {renderMediaContent()}

                {/* Timestamp */}
                <RNText
                  className={clsx(
                    "text-xs mt-1",
                    isMyMessage ? "text-gray-500" : "text-typography-500",
                  )}
                >
                  {new Date(message.createdAt || "").toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </RNText>
              </>
            )}
          </View>
          <MessageActions
            isVisible={showActions}
            isMyMessage={isMyMessage}
            onReaction={() => {
              setShowActions(false);
              setShowLongPressReaction(true);
            }}
            onRecall={() => {
              setShowActions(false);
              handleRecall();
            }}
            onDelete={() => {
              setShowActions(false);
              handleDelete();
            }}
            onForward={handleForward}
            onCopy={handleCopyMessage}
            onClose={handleCloseActions}
          />

          {/* Chỉ hiển thị reaction picker và nút reaction khi thỏa điều kiện */}
          {shouldShowReactionButton && !message.recalled && (
            <>
              {(showReactionPicker || showLongPressReaction) && (
                <>
                  {/* Overlay để xử lý click outside */}
                  <Pressable
                    onPress={handleCloseReactionPicker}
                    className="absolute inset-0 w-full h-screen z-10"
                  />

                  <View
                    className={clsx(
                      "absolute -bottom-0 bg-white rounded-full shadow-md py-2 px-3 z-20 flex-row items-center",
                      isMyMessage ? "right-0" : "left-0",
                    )}
                  >
                    <View>
                      <HStack space="sm">
                        {reactionOptions.map((reaction) => (
                          <TouchableOpacity
                            key={reaction.type}
                            onPress={() => handleReactionSelect(reaction.type)}
                            className="px-1"
                          >
                            <RNText className="text-xl">
                              {reaction.emoji}
                            </RNText>
                          </TouchableOpacity>
                        ))}
                      </HStack>
                    </View>
                    {hasReacted && (
                      <TouchableOpacity
                        onPress={() => {
                          handleUnReaction();
                          handleCloseReactionPicker();
                        }}
                        className="ml-2"
                      >
                        <HeartOff size={20} color="#c4c4c4" />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => setShowReactionPicker(!showReactionPicker)}
                className={clsx(
                  "absolute -bottom-5 bg-white rounded-full shadow-sm p-1.5 right-1 z-20",
                )}
              >
                {groupedReactions.length > 0 ? (
                  <HStack space="xs">
                    {groupedReactions.map((reaction, index) => {
                      const emoji = reactionOptions.find(
                        (opt) => opt.type === reaction.type,
                      )?.emoji;

                      return (
                        <View
                          key={index}
                          className={`flex-row items-center px-1 rounded-full ${reaction.userId === user?.userId ? "" : "bg-gray-100"}`}
                          style={
                            reaction.userId === user?.userId
                              ? { backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }
                              : undefined
                          }
                        >
                          <RNText className="text-xs">{emoji}</RNText>
                          <RNText className="text-xs text-gray-500 ">
                            {reaction.count}
                          </RNText>
                        </View>
                      );
                    })}
                  </HStack>
                ) : (
                  <Heart size={12} color="#c4c4c4" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image viewer */}
      <ImageViewer
        images={mediaItems
          .filter((media) => media.type === "IMAGE")
          .map((media) => media.url)}
        visible={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        initialIndex={selectedImageIndex}
      />

      {/* MessageForwardModal */}
      <MessageForwardModal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        messageId={message.id}
        currentRecipientId={
          !isMyMessage && message.messageType === "USER"
            ? message.senderId
            : message.receiverId
        }
        currentGroupId={
          message.messageType === "GROUP" ? message.groupId : undefined
        }
      />
    </>
  );
};

export default MessageBubble;
