import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { messageService } from "@/services/message-service";
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Check } from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./ui/select/select-actionsheet";
import { Friend } from "@/services/friend-service";
import { Colors } from "@/constants/Colors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  friends: Friend[];
}

export function MessageForwardModal({
  isOpen,
  onClose,
  messageId,
  friends,
}: Props) {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  const filteredFriends = friends.filter((friend) =>
    (friend.friend.userInfo.fullName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const toggleFriendSelection = (friendId: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
  };

  const handleForward = async () => {
    if (selectedFriends.size === 0) return;

    try {
      setIsForwarding(true);
      await messageService.forwardMessage({
        messageId,
        targets: Array.from(selectedFriends).map((userId) => ({
          userId,
        })),
      });
      onClose();
    } catch (error) {
      console.error("Error forwarding message:", error);
      // Hiển thị thông báo lỗi nếu cần
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-4 pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full">
          <Text className="text-xl font-bold text-center mb-4">
            Chuyển tiếp tin nhắn
          </Text>

          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item.friend.userInfo.id || ""}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  toggleFriendSelection(item.friend.userInfo.id || "")
                }
                className="py-2"
              >
                <HStack className="items-center justify-between">
                  <HStack className="items-center">
                    <Avatar size="md">
                      <AvatarFallbackText>
                        {item.friend.userInfo.fullName}
                      </AvatarFallbackText>
                      {item.friend.userInfo.profilePictureUrl && (
                        <AvatarImage
                          source={{
                            uri: item.friend.userInfo.profilePictureUrl,
                          }}
                        />
                      )}
                    </Avatar>
                    <Text className="ml-3 text-base">
                      {item.friend.userInfo.fullName}
                    </Text>
                  </HStack>
                  {selectedFriends.has(item.friend.userInfo.id || "") && (
                    <Check size={24} color="#3B82F6" />
                  )}
                </HStack>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            onPress={handleForward}
            disabled={selectedFriends.size === 0 || isForwarding}
            className={`mt-4 py-3 rounded-full items-center ${
              selectedFriends.size === 0 ? "bg-gray-300" : ""
            }`}
            style={
              selectedFriends.size > 0
                ? { backgroundColor: Colors.light.PRIMARY_500 }
                : undefined
            }
          >
            {isForwarding ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium">
                Chuyển tiếp ({selectedFriends.size})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
