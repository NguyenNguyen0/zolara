import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { getFriendList, Friend } from "@/services/friend-service";
import { messageService } from "@/services/message-service";
import { conversationService } from "@/services/conversation-service";
import { Check, Search, MessageCircle, User } from "lucide-react-native";
import { HStack } from "../ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { Conversation } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MessageForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  currentRecipientId?: string; // ID của người đang nhắn tin với mình
  currentGroupId?: string; // ID của nhóm đang nhắn tin
}

type TargetType = "USER" | "GROUP";

interface SelectedTarget {
  id: string;
  type: TargetType;
}

type TabType = "conversations" | "friends";

export const MessageForwardModal: React.FC<MessageForwardModalProps> = ({
  isOpen,
  onClose,
  messageId,
  currentRecipientId,
  currentGroupId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "conversations") {
        loadConversations();
      } else {
        loadFriends();
      }
      // Reset search and selection when modal opens
      setSearchQuery("");
      setSelectedTargets([]);
    }
  }, [isOpen, activeTab]);

  // Filter items based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    if (activeTab === "friends" && friends.length > 0) {
      if (query === "") {
        setFilteredFriends(friends);
      } else {
        const filtered = friends.filter((friend) =>
          friend.friend.userInfo.fullName?.toLowerCase().includes(query),
        );
        setFilteredFriends(filtered);
      }
    } else if (activeTab === "conversations" && conversations.length > 0) {
      if (query === "") {
        setFilteredConversations(conversations);
      } else {
        const filtered = conversations.filter((conv) => {
          if (conv.type === "USER" && conv.user) {
            return conv.user.fullName.toLowerCase().includes(query);
          } else if (conv.type === "GROUP" && conv.group) {
            return conv.group.name.toLowerCase().includes(query);
          }
          return false;
        });
        setFilteredConversations(filtered);
      }
    }
  }, [friends, conversations, searchQuery, activeTab]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await conversationService.getConversations(1, 50);
      if (result && result.conversations) {
        // Filter out the current conversation if needed
        const filteredList = result.conversations.filter((conv) => {
          // Không hiển thị cuộc trò chuyện hiện tại
          if (conv.type === "USER" && conv.user && currentRecipientId) {
            return conv.user.id !== currentRecipientId;
          }
          if (conv.type === "GROUP" && conv.group && currentGroupId) {
            return conv.group.id !== currentGroupId;
          }
          return true;
        });

        setConversations(filteredList);
        setFilteredConversations(filteredList);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const friendList = await getFriendList();

      // Filter out the current user and current recipient from the friend list
      const filteredList = friendList.filter(
        (friend) =>
          friend.friend.id !== currentUser?.userId &&
          (currentRecipientId ? friend.friend.id !== currentRecipientId : true),
      );

      setFriends(filteredList);
      setFilteredFriends(filteredList);
    } catch (err) {
      console.error("Error loading friends:", err);
      setError("Không thể tải danh sách bạn bè");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTargetSelection = (id: string, type: TargetType) => {
    const targetIndex = selectedTargets.findIndex(
      (target) => target.id === id && target.type === type,
    );

    if (targetIndex >= 0) {
      // Remove if already selected
      const newSelected = [...selectedTargets];
      newSelected.splice(targetIndex, 1);
      setSelectedTargets(newSelected);
    } else {
      // Add if not selected
      setSelectedTargets([...selectedTargets, { id, type }]);
    }
  };

  const isTargetSelected = (id: string, type: TargetType): boolean => {
    return selectedTargets.some(
      (target) => target.id === id && target.type === type,
    );
  };

  const handleForward = async () => {
    if (selectedTargets.length === 0) return;

    try {
      setIsForwarding(true);
      setError(null);

      await messageService.forwardMessage({
        messageId,
        targets: selectedTargets.map((target) => {
          if (target.type === "USER") {
            return { userId: target.id };
          } else {
            return { groupId: target.id };
          }
        }),
      });

      onClose();
    } catch (err) {
      console.error("Error forwarding message:", err);
      setError("Không thể chuyển tiếp tin nhắn");
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl px-4 pb-6"
          style={{ 
            paddingBottom: Math.max(insets.bottom, 24),
            maxHeight: "80%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Indicator */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="w-full">
            <Text className="text-xl font-bold text-center mb-4 pt-2">
              Chuyển tiếp tin nhắn
            </Text>

            {error && (
              <Text className="text-red-500 text-center mb-2">{error}</Text>
            )}

            {/* Tab Selector */}
            <View className="flex-row mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <TouchableOpacity
                onPress={() => setActiveTab("conversations")}
                className={`flex-1 flex-row items-center justify-center py-2 ${activeTab === "conversations" ? "" : "bg-white"}`}
                style={
                  activeTab === "conversations"
                    ? { backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }
                    : undefined
                }
              >
                <MessageCircle
                  size={18}
                  color={
                    activeTab === "conversations"
                      ? Colors.light.PRIMARY
                      : "#6B7280"
                  }
                />
                <Text
                  className={`ml-2 ${activeTab === "conversations" ? "font-medium" : "text-gray-500"}`}
                  style={
                    activeTab === "conversations"
                      ? { color: Colors.light.MESSAGE_BUBBLE_TEXT }
                      : undefined
                  }
                >
                  Cuộc trò chuyện
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("friends")}
                className={`flex-1 flex-row items-center justify-center py-2 ${activeTab === "friends" ? "" : "bg-white"}`}
                style={
                  activeTab === "friends"
                    ? { backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }
                    : undefined
                }
              >
                <User
                  size={18}
                  color={
                    activeTab === "friends"
                      ? Colors.light.PRIMARY
                      : "#6B7280"
                  }
                />
                <Text
                  className={`ml-2 ${activeTab === "friends" ? "font-medium" : "text-gray-500"}`}
                  style={
                    activeTab === "friends"
                      ? { color: Colors.light.MESSAGE_BUBBLE_TEXT }
                      : undefined
                  }
                >
                  Bạn bè
                </Text>
              </TouchableOpacity>
            </View>

            {/* Thanh tìm kiếm */}
            <View className="mb-4 px-2 flex-row items-center border border-gray-300 rounded-full overflow-hidden">
              <Search size={20} color="#6B7280" className="ml-2" />
              <TextInput
                className="flex-1 py-2 px-3 text-base"
                placeholder={
                  activeTab === "conversations"
                    ? "Tìm kiếm cuộc trò chuyện..."
                    : "Tìm kiếm bạn bè..."
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" className="my-4" />
            ) : (
              <ScrollView className="max-h-96">
                <View className="gap-3">
                  {activeTab === "conversations" ? (
                    // Conversations Tab
                    filteredConversations.length === 0 ? (
                      <Text className="text-center text-gray-500 py-4">
                        {searchQuery
                          ? "Không tìm thấy cuộc trò chuyện nào"
                          : "Bạn chưa có cuộc trò chuyện nào"}
                      </Text>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const isUserConversation = conversation.type === "USER";
                        const name = isUserConversation
                          ? conversation.user?.fullName
                          : conversation.group?.name;
                        const avatarUrl = isUserConversation
                          ? conversation.user?.profilePictureUrl
                          : conversation.group?.avatarUrl;
                        const id = isUserConversation
                          ? conversation.user?.id
                          : conversation.group?.id;

                        if (!id) return null;

                        return (
                          <TouchableOpacity
                            key={conversation.id}
                            onPress={() =>
                              toggleTargetSelection(id, conversation.type)
                            }
                            className="flex-row items-center p-2 rounded-lg active:bg-gray-50"
                          >
                            <HStack space="md" className="items-center flex-1">
                              <Avatar size="md">
                                {avatarUrl ? (
                                  <AvatarImage
                                    source={{
                                      uri: avatarUrl,
                                    }}
                                  />
                                ) : (
                                  <AvatarFallbackText>
                                    {name?.slice(0, 2).toUpperCase() || "??"}
                                  </AvatarFallbackText>
                                )}
                              </Avatar>
                              <View className="flex-1">
                                <Text className="text-base">{name}</Text>
                                {conversation.type === "GROUP" && (
                                  <Text className="text-xs text-gray-500">
                                    Nhóm
                                  </Text>
                                )}
                              </View>
                              {isTargetSelected(id, conversation.type) && (
                                <Check
                                  color={Colors.light.PRIMARY}
                                  size={24}
                                />
                              )}
                            </HStack>
                          </TouchableOpacity>
                        );
                      })
                    )
                  ) : // Friends Tab
                  filteredFriends.length === 0 ? (
                    <Text className="text-center text-gray-500 py-4">
                      {searchQuery
                        ? "Không tìm thấy bạn bè nào"
                        : "Bạn chưa có bạn bè nào"}
                    </Text>
                  ) : (
                    filteredFriends.map((friend) => (
                      <TouchableOpacity
                        key={friend.friend.id}
                        onPress={() =>
                          toggleTargetSelection(friend.friend.id, "USER")
                        }
                        className="flex-row items-center p-2 rounded-lg active:bg-gray-50"
                      >
                        <HStack space="md" className="items-center flex-1">
                          <Avatar size="md">
                            {friend.friend.userInfo.profilePictureUrl ? (
                              <AvatarImage
                                source={{
                                  uri: friend.friend.userInfo.profilePictureUrl,
                                }}
                              />
                            ) : (
                              <AvatarFallbackText>
                                {friend.friend.userInfo.fullName
                                  ?.slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallbackText>
                            )}
                          </Avatar>
                          <Text className="flex-1 text-base">
                            {friend.friend.userInfo.fullName}
                          </Text>
                          {isTargetSelected(friend.friend.id, "USER") && (
                            <Check color={Colors.light.PRIMARY} size={24} />
                          )}
                        </HStack>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={handleForward}
              disabled={selectedTargets.length === 0 || isForwarding}
              className={`mt-4 p-3 rounded-full mx-12 items-center justify-center ${selectedTargets.length > 0 ? "" : "bg-gray-400"}`}
              style={
                selectedTargets.length > 0
                  ? { backgroundColor: Colors.light.PRIMARY_500 }
                  : undefined
              }
            >
              <Text className="text-white font-medium text-lg">
                {isForwarding
                  ? "Đang chuyển tiếp..."
                  : selectedTargets.length > 0
                    ? `Chuyển tiếp (${selectedTargets.length})`
                    : "Chuyển tiếp"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
