import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSocket } from "@/hooks/useSocket";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  FriendRequest,
  getReceivedFriendRequests,
  getSentFriendRequests,
  respondToFriendRequest,
  cancelFriendRequest,
} from "@/services/friend-service";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

const ReceivedRequestItem = ({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const handleViewProfile = () => {
    if (request.sender?.id) {
      router.push({
        pathname: "/(screens)/(user)/info/[id]" as any,
        params: { id: request.sender.id },
      });
    }
  };
  return (
    <VStack className="bg-white p-4 mb-2">
      <HStack className="items-center mb-2">
        <HStack className="items-start flex-1">
          <TouchableOpacity onPress={handleViewProfile}>
            <Avatar size="lg">
              <AvatarFallbackText>
                {request.sender?.userInfo?.fullName || "Không có tên"}
              </AvatarFallbackText>
              {request.sender?.userInfo?.profilePictureUrl && (
                <AvatarImage
                  source={{ uri: request.sender.userInfo.profilePictureUrl }}
                />
              )}
            </Avatar>
          </TouchableOpacity>
          <VStack className="ml-4 flex-1">
            <TouchableOpacity onPress={handleViewProfile}>
              <Text className="font-semibold text-lg">
                {request.sender?.userInfo?.fullName || "Không có tên"}
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm">
              {formatDate(request.createdAt)}
            </Text>
            <Text className="text-gray-600 my-3 border rounded-lg border-gray-300 p-2.5 py-3">
              {request.introduce || "Không có lời giới thiệu"}
            </Text>

            <HStack className="space-x-2">
              <TouchableOpacity
                onPress={onReject}
                className="flex-1 bg-gray-100 py-2 rounded-full items-center mr-2"
              >
                <Text className="text-gray-600 font-medium">TỪ CHỐI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onAccept}
                className="flex-1 py-2 rounded-full items-center ml-2"
                style={{ backgroundColor: Colors.light.PRIMARY_100 }}
              >
                <Text
                  className="font-medium"
                  style={{ color: Colors.light.PRIMARY_500 }}
                >
                  ĐỒNG Ý
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  );
};

const SentRequestItem = ({
  request,
  onCancel,
}: {
  request: FriendRequest;
  onCancel: () => void;
}) => {
  const handleViewProfile = () => {
    if (request.receiver?.id) {
      router.push({
        pathname: "/(screens)/(user)/info/[id]" as any,
        params: { id: request.receiver.id },
      });
    }
  };
  return (
    <VStack className="bg-white p-4 mb-2">
      <HStack className="items-center mb-2">
        <HStack className="items-start flex-1">
          <TouchableOpacity onPress={handleViewProfile}>
            <Avatar size="lg">
              <AvatarFallbackText>
                {request.receiver?.userInfo?.fullName || "Không có tên"}
              </AvatarFallbackText>
              {request.receiver?.userInfo?.profilePictureUrl && (
                <AvatarImage
                  source={{ uri: request.receiver.userInfo.profilePictureUrl }}
                />
              )}
            </Avatar>
          </TouchableOpacity>
          <VStack className="ml-4 flex-1">
            <TouchableOpacity onPress={handleViewProfile}>
              <Text className="font-semibold text-lg">
                {request.receiver?.userInfo?.fullName || "Không có tên"}
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm">
              {formatDate(request.createdAt)}
            </Text>
            <Text className="text-gray-600 my-3 border rounded-lg border-gray-300 p-2.5 py-3">
              {request.introduce || "Không có lời giới thiệu"}
            </Text>

            <TouchableOpacity
              onPress={onCancel}
              className="bg-gray-100 py-2 rounded-full items-center ml-32"
            >
              <Text className="text-gray-600 font-medium ">HỦY LỜI MỜI</Text>
            </TouchableOpacity>
          </VStack>
        </HStack>
      </HStack>
    </VStack>
  );
};

export default function FriendRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { refresh } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kết nối đến namespace friends của WebSocket
  const { socket, isConnected, error: socketError } = useSocket("friends");

  // Định nghĩa fetchFriendRequests với useCallback
  const fetchFriendRequests = React.useCallback(
    async (source: string = "manual") => {
      try {
        console.log(`Fetching friend requests (source: ${source})`);
        setIsLoading(true);
        setError(null);

        // Fetch both received and sent requests in parallel
        const [receivedData, sentData] = await Promise.all([
          getReceivedFriendRequests(),
          getSentFriendRequests(),
        ]);

        setReceivedRequests(receivedData);
        setSentRequests(sentData);

        // Xóa tham số refresh khỏi URL sau khi đã cập nhật dữ liệu
        if (refresh === "true") {
          // Sử dụng router.setParams để thay thế URL hiện tại mà không thêm vào lịch sử
          router.setParams({ refresh: undefined });
        }
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
        setError(
          "Không thể tải danh sách lời mời kết bạn. Vui lòng thử lại sau.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [refresh],
  );

  // Fetch friend requests on component mount
  useEffect(() => {
    fetchFriendRequests("mount");
  }, [fetchFriendRequests]);

  // Cập nhật dữ liệu khi tham số refresh thay đổi
  useEffect(() => {
    if (refresh === "true") {
      console.log("Refreshing friend requests due to refresh parameter");
      fetchFriendRequests("refresh-param");
    }
  }, [refresh, fetchFriendRequests]);

  // Refetch friend requests when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Friend requests screen focused, refreshing requests");
      fetchFriendRequests("focus");
      return () => {};
    }, [fetchFriendRequests]),
  );

  // Theo dõi trạng thái kết nối WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log(
        "Socket connected to friends namespace in friend requests screen",
      );
    } else if (socketError) {
      console.error(
        "Socket connection error in friend requests screen:",
        socketError,
      );
    }
  }, [isConnected, socketError]);

  // Lắng nghe sự kiện reload từ WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("Setting up reload listener in friend requests screen");

    // Lắng nghe sự kiện reload
    const handleReload = () => {
      console.log(
        "Received reload event from server, refreshing friend requests",
      );
      fetchFriendRequests("websocket");
    };

    socket.on("reload", handleReload);

    // Dọn dẹp listener khi component unmount hoặc socket thay đổi
    return () => {
      console.log("Removing reload listener from friend requests screen");
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected, fetchFriendRequests]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest(requestId, "ACCEPTED");
      // Remove the accepted request from the list
      setReceivedRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId),
      );
    } catch (err) {
      console.error("Failed to accept friend request:", err);
      alert("Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại sau.");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest(requestId, "DECLINED");
      // Remove the rejected request from the list
      setReceivedRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId),
      );
    } catch (err) {
      console.error("Failed to reject friend request:", err);
      alert("Không thể từ chối lời mời kết bạn. Vui lòng thử lại sau.");
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      // Remove the canceled request from the list
      setSentRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== requestId),
      );
    } catch (err) {
      console.error("Failed to cancel friend request:", err);
      alert("Không thể hủy lời mời kết bạn. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
      >
        {/* WebSocket connection indicator */}
        <HStack
          className="bg-transparent flex-row items-center p-4"
          style={{
            paddingTop: insets.top,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={26} color="white" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-semibold text-white">
            Lời mời kết bạn
          </Text>
        </HStack>
      </LinearGradient>

      {/* Tabs */}
      <HStack className="bg-white">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "received" ? "border-b-2" : ""}`}
          style={
            activeTab === "received"
              ? { borderBottomColor: Colors.light.PRIMARY_500 }
              : undefined
          }
          onPress={() => setActiveTab("received")}
        >
          <Text
            className={`text-center ${activeTab === "received" ? "" : "text-gray-500"}`}
            style={
              activeTab === "received"
                ? { color: Colors.light.PRIMARY_500 }
                : undefined
            }
          >
            Đã nhận ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "sent" ? "border-b-2" : ""}`}
          style={
            activeTab === "sent"
              ? { borderBottomColor: Colors.light.PRIMARY_500 }
              : undefined
          }
          onPress={() => setActiveTab("sent")}
        >
          <Text
            className={`text-center ${activeTab === "sent" ? "" : "text-gray-500"}`}
            style={
              activeTab === "sent"
                ? { color: Colors.light.PRIMARY_500 }
                : undefined
            }
          >
            Đã gửi ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </HStack>

      {/* Request Lists */}
      <ScrollView className="flex-1 pt-2">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
            <Text className="text-gray-500 mt-2">Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchFriendRequests("retry")}
              className="mt-4 px-4 py-2 rounded-full"
              style={{ backgroundColor: Colors.light.PRIMARY_50 }}
            >
              <Text style={{ color: Colors.light.PRIMARY_500 }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === "received" ? (
          receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <ReceivedRequestItem
                key={request.id}
                request={request}
                onAccept={() => handleAcceptRequest(request.id)}
                onReject={() => handleRejectRequest(request.id)}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">
                Không có lời mời kết bạn nào
              </Text>
            </View>
          )
        ) : sentRequests.length > 0 ? (
          sentRequests.map((request) => (
            <SentRequestItem
              key={request.id}
              request={request}
              onCancel={() => handleCancelRequest(request.id)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500">Chưa gửi lời mời kết bạn nào</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
