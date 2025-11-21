import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Text,
  Modal,
  ListRenderItem,
  TextInput as RNTextInput,
  Clipboard,
} from "react-native";
import {
  Image as ImageIcon,
  Mic,
  SendHorizonal,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { Message, GroupMember } from "@/types";
import { useConversationsStore } from "@/store/conversationsStore";
import { groupService } from "@/services/group-service";
import * as ImagePicker from "expo-image-picker";
import { ChatHeader } from "@/components/chat/chat.header";
import MessageBubble from "@/components/chat/message.bubble";
import { MediaPreview } from "@/components/chat/media.preview";
import VoiceRecorder from "@/components/chat/voice.recorder";
import { useChatStore } from "@/store/chatStore";
import { debounce } from "lodash";

const ChatScreen = () => {
  const {
    loading,
    messages,
    loadMessages,
    refreshing,
    typingUsers,
    page,
    hasMore,
    isLoadingMedia,
    selectedMedia,
    sendMessage,
    sendMediaMessage,
    handleReaction,
    handleUnReaction,
    handleRecall,
    handleDelete,
    setRefreshing,
    setSelectedMedia,
    setSelectedContact,
    setSelectedGroup,
  } = useChatStore();

  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const router = useRouter();
  const { id: chatId, name, avatarUrl, type } = useLocalSearchParams();
  const isGroupChat = type === "GROUP";

  useEffect(() => {
    if (chatId) {
      const chatType = type === "GROUP" ? "GROUP" : "USER";
      useChatStore.getState().setCurrentChat({
        id: chatId as string,
        name: name as string,
        type: chatType as "USER" | "GROUP",
      });
      useChatStore.getState().setCurrentChatType(chatType as "USER" | "GROUP");

      if (chatType === "USER") {
        setSelectedContact({
          userId: chatId as string,
          fullName: name as string,
          email: null,
          phoneNumber: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        setSelectedGroup({
          id: chatId as string,
          name: name as string,
          profilePictureUrl: avatarUrl as string,
        });
        fetchGroupMembers(chatId as string);
      }
    }

    return () => {
      useChatStore.getState().setCurrentChat(null);
      useChatStore.getState().setCurrentChatType(null);
    };
  }, [chatId, name, avatarUrl, type]);

  useEffect(() => {
    if (chatId) {
      console.log(`Initializing chat screen for ${chatId}`);
      loadMessages(chatId as string);
      const conversationsStore = useConversationsStore.getState();
      conversationsStore.markAsRead(chatId as string, type as "USER" | "GROUP");
    } else {
      console.error("Cannot load messages: No chat ID provided");
    }
  }, [chatId, type]);

  const isLoadingMore = useRef(false);

  useEffect(() => {
    if (!isFirstLoad && messages.length > 0 && !isLoadingMore.current) {
      scrollToBottom();
    }
    if (isFirstLoad && messages.length > 0) {
      setIsFirstLoad(false);
      scrollToBottom(false);
    }
  }, [messages, isFirstLoad]);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({
        index: 0,
        animated,
        viewPosition: 1,
      });
    }
  };

  const handleRefresh = async () => {
    if (!chatId) {
      console.error("Cannot refresh: No chat ID provided");
      return;
    }
    setRefreshing(true);
    try {
      await loadMessages(chatId as string, 1);
    } catch (error) {
      console.error("Error refreshing messages:", error);
      Alert.alert("Error", "Could not load messages. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    if (!chatId) {
      console.error("Cannot load more: No chat ID provided");
      return;
    }
    try {
      isLoadingMore.current = true;
      await loadMessages(chatId as string, page + 1);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setTimeout(() => {
        isLoadingMore.current = false;
      }, 500);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    await sendMessage(chatId as string, message, user.userId);
    setMessage("");
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleSendMediaMessage = async () => {
    if (!user || selectedMedia.length === 0) return;
    await sendMediaMessage(
      chatId as string,
      message,
      user.userId,
      selectedMedia,
    );
    setMessage("");
    setSelectedMedia([]);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleMediaUpload = async () => {
    if (!user) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"], //MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });
      if (!result.canceled && result.assets.length > 0) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        const invalidFiles = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > MAX_FILE_SIZE,
        );
        if (invalidFiles.length > 0) {
          Alert.alert("File quá lớn", "Ảnh hoặc video phải nhỏ hơn 10MB.");
          return;
        }
        setSelectedMedia(
          result.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type === "video" ? "VIDEO" : "IMAGE",
            width: asset.width,
            height: asset.height,
          })),
        );
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
      console.error("Media picker error:", error);
    }
  };

  const renderItem: ListRenderItem<Message> = ({ item: msg, index }) => {
    const senderInfo = getSenderInfo(msg.senderId);
    return (
      <MessageBubble
        message={msg}
        profilePictureUrl={senderInfo.profilePic}
        senderName={senderInfo.name}
        isGroupChat={isGroupChat}
        onReaction={handleReaction}
        onRecall={handleRecall}
        onDelete={handleDelete}
        onUnReaction={handleUnReaction}
        isLastMessageOfUser={getIsLastMessageOfUser(msg, index)}
      />
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loading) {
      handleLoadMore();
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const groupDetails = await groupService.getGroupDetails(groupId);
      if (groupDetails && groupDetails.members) {
        setGroupMembers(groupDetails.members);
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const getSenderInfo = (senderId: string) => {
    if (!isGroupChat)
      return { name: undefined, profilePic: avatarUrl as string };
    const member = groupMembers.find((member) => member.userId === senderId);
    if (member) {
      const memberAny = member as any;
      return {
        name: memberAny.user?.fullName || memberAny.fullName,
        profilePic:
          memberAny.user?.profilePictureUrl || memberAny.profilePictureUrl,
      };
    }
    return { name: undefined, profilePic: undefined };
  };

  const getIsLastMessageOfUser = (message: Message, index: number) => {
    if (index === messages.length - 1) return true;
    const nextMessage = messages[index + 1];
    return message.senderId !== nextMessage.senderId;
  };

  const renderTypingIndicator = () => {
    const typingUsersMap = new Map(typingUsers);
    if (user?.userId) {
      typingUsersMap.delete(user.userId);
    }
    const typingUsersArray = Array.from(typingUsersMap.entries()).map(
      ([userId, data]) => ({ userId, ...data }),
    );
    if (typingUsersArray.length > 0) {
      if (isGroupChat) {
        const typingNames = typingUsersArray.map((typingUser) => {
          const member = groupMembers.find(
            (m) => m.userId === typingUser.userId,
          );
          if (!member) return "Someone";
          const memberAny = member as any;
          return memberAny.user?.fullName || memberAny.fullName || "Someone";
        });
        let typingText = "";
        if (typingNames.length === 1) {
          typingText = `${typingNames[0]} đang soạn tin ...`;
        } else if (typingNames.length === 2) {
          typingText = `${typingNames[0]} và ${typingNames[1]} đang soạn tin ...`;
        } else if (typingNames.length > 2) {
          typingText = `${typingNames[0]} và ${typingNames.length - 1} người khác đang soạn tin ...`;
        }
        return (
          <Text
            className="py-0.5 px-2 text-sm bg-transparent"
            style={{ color: Colors.light.PRIMARY_500 }}
          >
            {typingText}
          </Text>
        );
      } else {
        return (
          <Text 
            className="text-sm p-2 bg-none"
            style={{ color: Colors.light.PRIMARY_500 }}
          >
            đang soạn tin...
          </Text>
        );
      }
    }
    return null;
  };

  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      try {
        useChatStore.getState().handleTypingStatus(isTyping);
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }, 500),
    [],
  );

  return (
    <View className="flex-1 bg-gray-100">
      <>
        <ChatHeader
          user={chatId as string}
          chatId={chatId as string}
          name={name as string}
          avatarUrl={avatarUrl as string}
          isGroup={type === "GROUP"}
          onBack={() => router.back()}
        />
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          renderItem={renderItem}
          keyExtractor={(item, index) => {
            // Ensure unique key by combining id with index to handle duplicate ids
            // This prevents "Encountered two children with the same key" error
            return `${item.id}_${index}`;
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          inverted={true}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loading ? <ActivityIndicator className="py-4" /> : null
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
          {selectedMedia.length > 0 && (
            <MediaPreview
              mediaItems={selectedMedia}
              onRemove={(index) => {
                const updatedMedia = selectedMedia.filter(
                  (_, i) => i !== index,
                );
                setSelectedMedia(updatedMedia);
              }}
            />
          )}
          {/* typing trick-ger */}
          {renderTypingIndicator()}
          <View
            className="flex-row justify-center items-center bg-white px-4 pt-2"
            style={{ paddingBottom: Platform.OS === "ios" ? 20 : 8 }}
          >
            <TextInput
              className="flex-1 ml-2.5 p-1 bg-transparent justify-center text-gray-700 text-base"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                debouncedTyping(text.length > 0);
              }}
              multiline
              numberOfLines={message.length > 100 ? 4 : 1}
              textAlignVertical="center"
              style={{ minHeight: 40, maxHeight: 70 }}
            />
            {!message.trim() && selectedMedia.length === 0 ? (
              <View className="flex-row relative">
                <TouchableOpacity
                  className="mx-2"
                  disabled={isLoadingMedia}
                  onPress={() => setShowVoiceRecorder(true)}
                >
                  <Mic
                    size={26}
                    color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className="mx-2"
                  onPress={handleMediaUpload}
                  disabled={isLoadingMedia}
                >
                  <ImageIcon
                    size={26}
                    color={isLoadingMedia ? "#c4c4c4" : "#c4c4c4"}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={
                    selectedMedia.length > 0
                      ? handleSendMediaMessage
                      : handleSend
                  }
                  disabled={
                    (!message.trim() && selectedMedia.length === 0) ||
                    isLoadingMedia
                  }
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
        <Modal
          visible={showVoiceRecorder}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowVoiceRecorder(false)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <VoiceRecorder
              onClose={() => setShowVoiceRecorder(false)}
              onSend={(uri) => {
                if (user) {
                  const voiceMedia = [
                    {
                      uri,
                      type: "AUDIO" as const,
                      name: `voice_message_${Date.now()}.m4a`,
                      mediaType: "AUDIO",
                    },
                  ];
                  console.log("---- voice: ", voiceMedia);
                  sendMediaMessage(
                    chatId as string,
                    "",
                    user.userId,
                    voiceMedia,
                  );
                  setShowVoiceRecorder(false);
                }
              }}
            />
          </View>
        </Modal>
      </>
    </View>
  );
};

export default ChatScreen;
