import React from "react";
import { View, TouchableOpacity, Text, Modal, Pressable } from "react-native";
import {
  Trash2,
  RefreshCcw,
  Heart,
  Forward,
  Copy,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

interface MessageActionsProps {
  isVisible: boolean;
  isMyMessage: boolean;
  onReaction: () => void;
  onRecall: () => void;
  onDelete: () => void;
  onForward: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isVisible,
  isMyMessage,
  onReaction,
  onRecall,
  onDelete,
  onForward,
  onCopy,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
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
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Indicator */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="w-full">
            <Text className="text-xl font-bold text-center mb-4 pt-2">
              Tùy chọn tin nhắn
            </Text>

            <View className="mt-2 gap-3">
              <TouchableOpacity
                onPress={() => {
                  onReaction();
                  onClose();
                }}
                className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
              >
                <View
                  className="p-2 rounded-full mr-3"
                  style={{ backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }}
                >
                  <Heart size={22} color={Colors.light.PRIMARY} />
                </View>
                <Text className="text-base font-medium">Thả cảm xúc</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onCopy();
                  onClose();
                }}
                className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
              >
                <View
                  className="p-2 rounded-full mr-3"
                  style={{ backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }}
                >
                  <Copy size={22} color={Colors.light.PRIMARY} />
                </View>
                <Text className="text-base font-medium">Sao chép tin nhắn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onForward();
                  onClose();
                }}
                className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
              >
                <View
                  className="p-2 rounded-full mr-3"
                  style={{ backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }}
                >
                  <Forward size={22} color={Colors.light.PRIMARY} />
                </View>
                <Text className="text-base font-medium">Chuyển tiếp</Text>
              </TouchableOpacity>

              {isMyMessage && (
                <TouchableOpacity
                  onPress={() => {
                    onRecall();
                    onClose();
                  }}
                  className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
                >
                  <View
                    className="p-2 rounded-full mr-3"
                    style={{ backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }}
                  >
                    <RefreshCcw size={22} color={Colors.light.PRIMARY} />
                  </View>
                  <Text className="text-base font-medium">Thu hồi</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  onDelete();
                  onClose();
                }}
                className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
              >
                <View className="bg-red-50 p-2 rounded-full mr-3">
                  <Trash2 size={22} color="#EF4444" />
                </View>
                <Text className="text-base font-medium text-red-500">
                  Xóa tin nhắn
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
