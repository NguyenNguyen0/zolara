import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/hooks/useSocket";
import { ArrowLeft, Edit3 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import * as userService from "@/services/user-service";
import { sendFriendRequest } from "@/services/friend-service";
import { LinearGradient } from "expo-linear-gradient";

export default function FriendRequestScreen() {
  const insets = useSafeAreaInsets();
  const { id, introduce: initialIntroduce } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [introduce, setIntroduce] = useState(
    initialIntroduce
      ? String(initialIntroduce)
      : "Xin chào, mình muốn kết bạn với bạn.",
  );
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARACTERS = 150;

  // Kết nối đến namespace friends của WebSocket
  const { socket, isConnected, error: socketError } = useSocket("friends");

  useEffect(() => {
    fetchUserInfo();
  }, [id]);

  useEffect(() => {
    setCharacterCount(introduce.length);
  }, [introduce]);

  // Theo dõi trạng thái kết nối WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log(
        `Socket connected to friends namespace in friend request screen for user ${id}`,
      );
    } else if (socketError) {
      console.error(
        `Socket connection error in friend request screen:`,
        socketError,
      );
    }
  }, [isConnected, socketError, id]);

  // Lắng nghe sự kiện reload từ WebSocket
  useEffect(() => {
    if (!socket || !isConnected || !userProfile) return;

    console.log(
      `Setting up reload listener in friend request screen for user ${id}`,
    );

    // Lắng nghe sự kiện reload
    const handleReload = async () => {
      console.log(
        "Received reload event from server while composing friend request",
      );

      // Kiểm tra lại trạng thái mối quan hệ với người dùng
      try {
        const updatedUserData = await userService.getUserProfile(String(id));

        // Nếu người dùng B đã gửi lời mời kết bạn cho người dùng A
        if (updatedUserData.relationship?.status === "PENDING_RECEIVED") {
          // Hiển thị thông báo
          Alert.alert(
            "Thông báo",
            `${updatedUserData.userInfo?.fullName || "Người dùng"} đã gửi lời mời kết bạn cho bạn!`,
            [
              {
                text: "OK",
                onPress: () => {
                  // Quay lại màn hình thông tin người dùng
                  router.push({
                    pathname: "/(screens)/(user)/info/[id]" as any,
                    params: { id: String(id), refresh: "true" },
                  });
                },
              },
            ],
          );
        }
      } catch (error) {
        console.error(
          "Error checking user relationship after reload event:",
          error,
        );
      }
    };

    socket.on("reload", handleReload);

    // Dọn dẹp listener khi component unmount hoặc socket thay đổi
    return () => {
      console.log(
        `Removing reload listener from friend request screen for user ${id}`,
      );
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected, id, userProfile]);

  const fetchUserInfo = async () => {
    if (!id || typeof id !== "string") {
      setError("ID người dùng không hợp lệ");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userData = await userService.getUserProfile(id);
      setUserProfile(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!userProfile?.id) return;

    try {
      setIsSending(true);
      setError(null);

      // Gọi API gửi lời mời kết bạn
      await sendFriendRequest(userProfile.id, introduce);

      // Đặt một biến toàn cục để báo hiệu cần cập nhật màn hình profile
      // Biến này sẽ được kiểm tra trong useEffect của màn hình profile
      // @ts-ignore - Bỏ qua cảnh báo TypeScript về biến toàn cục
      global.FRIEND_REQUEST_SENT = {
        userId: userProfile.id,
        timestamp: Date.now(),
      };

      // Đơn giản chỉ cần quay lại màn hình trước đó
      router.back();
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Không thể gửi lời mời kết bạn. Vui lòng thử lại sau.");
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <LinearGradient
          start={{ x: 0.03, y: 0 }}
          end={{ x: 0.99, y: 2.5 }}
          colors={Colors.light.GRADIENT as any}
          style={{
            paddingTop: Platform.OS === "ios" ? 0 : insets.top,
          }}
        >
          {/* WebSocket connection indicator */}
          <View style={{ paddingTop: insets.top }} className="pb-4 px-4">
            <HStack className="items-center">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-medium ml-4">
                Kết bạn
              </Text>
            </HStack>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator
                size="large"
                color={Colors.light.PRIMARY}
              />
              <Text className="text-gray-500 mt-2">Đang tải thông tin...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-red-500">{error}</Text>
              <TouchableOpacity
                onPress={fetchUserInfo}
                style={{
                  marginTop: 16,
                  backgroundColor: "#EBF5FF",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 9999,
                }}
              >
                <Text style={{ color: "#3B82F6" }}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <VStack className="p-4">
              {/* User Info */}
              <HStack className="items-center mb-6">
                <Avatar size="lg">
                  <AvatarFallbackText>
                    {userProfile?.userInfo?.fullName || "User"}
                  </AvatarFallbackText>
                  {userProfile?.userInfo?.profilePictureUrl && (
                    <AvatarImage
                      source={{ uri: userProfile.userInfo.profilePictureUrl }}
                    />
                  )}
                </Avatar>
                <VStack className="ml-4">
                  <Text className="text-lg font-medium">
                    {userProfile?.userInfo?.fullName || "Người dùng"}
                  </Text>
                  <HStack className="items-center">
                    <Edit3 size={14} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      Thêm lời giới thiệu
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              {/* Message Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 rounded-lg p-4 text-base min-h-[120px]"
                  multiline
                  placeholder="Xin chào, mình muốn kết bạn với bạn."
                  value={introduce}
                  onChangeText={(text) => {
                    if (text.length <= MAX_CHARACTERS) {
                      setIntroduce(text);
                    }
                  }}
                  maxLength={MAX_CHARACTERS}
                  textAlignVertical="top"
                />
                <Text className="text-right text-gray-500 mt-1">
                  {characterCount}/{MAX_CHARACTERS}
                </Text>
              </View>

              {/* Block Diary Option */}
              {/* <HStack className="items-center justify-between mb-6">
                <Text className="text-base">Chặn xem nhật ký của tôi</Text>
                <View className="w-6 h-6 rounded-full border border-gray-300" />
              </HStack> */}

              {/* Send Button */}
              <TouchableOpacity
                className="py-3 rounded-full items-center mt-4"
                style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                onPress={handleSendRequest}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-base">
                    Gửi yêu cầu
                  </Text>
                )}
              </TouchableOpacity>
            </VStack>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
