import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import type { ChatHeaderProps, GroupInfo } from "@/types";
import { useRouter } from "expo-router";
import { groupService } from "@/services/group-service";
import { useUserStatusStore } from "@/store/userStatusStore";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";

const formatLastSeen = (lastSeenDate: string) => {
  const date = new Date(lastSeenDate);
  const now = new Date();
  const diffMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffMinutes < 1) return "Vừa mới truy cập";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return date.toLocaleDateString();
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  chatId,
  name,
  isGroup,
  isAIAssistant = false,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isOnline = useUserStatusStore((state) => state.isUserOnline(chatId));
  const userStatus = useUserStatusStore((state) => state.getUserStatus(chatId));
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    if (isGroup) {
      groupService.getGroupInfo(chatId).then((info) => {
        setGroupInfo(info);
      });
    }
  }, [isGroup, chatId]);

  const getStatusText = () => {
    if (isGroup) return `Số thành viên: ${groupInfo?.memberCount}`;
    if (isAIAssistant) return "Trợ lý ảo Zolara";
    if (isOnline && !isGroup) return "Đang hoạt động";
    if (!userStatus?.timestamp) return "Không hoạt động";
    return `${formatLastSeen(userStatus.timestamp.toISOString())}`;
  };

  const getStatusColor = () => {
    if (isGroup) return "bg-transparent";
    if (isAIAssistant) return "bg-red-500";
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <LinearGradient
      start={{ x: 0.03, y: 0 }}
      end={{ x: 0.99, y: 2.5 }}
      colors={Colors.light.GRADIENT as any}
    >
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 5,
        }}
      >
        <HStack className="items-center justify-between w-full">
          <HStack className="items-center flex-1">
            <TouchableOpacity onPress={onBack}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <VStack className="pl-2.5">
              <Text
                className="text-lg font-semibold text-white mr-2.5"
                numberOfLines={1}
              >
                {name}
              </Text>
              <HStack className="items-center">
                {!isGroup && (
                  <View
                    className={`w-3 h-3 rounded-full mr-1.5 ${getStatusColor()}`}
                  />
                )}
                <Text className="text-xs text-gray-200">{getStatusText()}</Text>
              </HStack>
            </VStack>
          </HStack>
          {!isAIAssistant && (
            <HStack className="space-x-4">
              <Pressable
                onPress={() => Alert.alert("Coming Soon")}
                className="pr-4"
              >
                <FontAwesome5 name="phone-alt" size={23} color="white" />
              </Pressable>
              {/* <Pressable
                onPress={() => Alert.alert("Coming Soon")}
                className="px-2.5"
              >
                <Video size={23} color="white" strokeWidth={1.5} />
              </Pressable> */}
              <Pressable
                className="pl-2.5"
                onPress={() => {
                  if (isGroup) {
                    router.push(`/group/${chatId}`);
                  } else {
                    router.push(`/info/${chatId}` as any);
                  }
                }}
              >
                <AntDesign name="menu" size={23} color="white" />
              </Pressable>
            </HStack>
          )}
        </HStack>
      </View>
    </LinearGradient>
  );
};
