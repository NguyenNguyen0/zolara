import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { ArrowLeft, RefreshCw, Search, UserPlus, X } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import * as Contacts from "expo-contacts";
import {
  ContactItem as ContactItemType,
  getContacts,
  syncContacts,
  cancelFriendRequest,
  respondToFriendRequest,
} from "@/services/friend-service";
import { useSocket } from "@/hooks/useSocket";

// Interface cho contact item hiển thị trên UI
interface DisplayContact {
  id: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  relationshipStatus: string;
  friendshipId?: string;
}

const ContactItem = ({
  contact,
  onAddFriend,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
}: {
  contact: DisplayContact;
  onAddFriend: (id: string) => void;
  onCancelRequest: (id: string) => void;
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}) => {
  const handleViewProfile = () => {
    router.push({
      pathname: "/(screens)/(user)/info/[id]" as any,
      params: { id: contact.id },
    });
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white">
      <Pressable onPress={handleViewProfile} className="flex-1">
        <View className="flex-row items-center">
          <Avatar size="md">
            <AvatarFallbackText>{contact.fullName}</AvatarFallbackText>
            {contact.avatarUrl && (
              <AvatarImage source={{ uri: contact.avatarUrl }} />
            )}
          </Avatar>
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium">{contact.fullName}</Text>
            <Text className="text-sm text-gray-500">{contact.phoneNumber}</Text>
          </View>
        </View>
      </Pressable>

      {/* Hiển thị các nút tương tác dựa trên trạng thái mối quan hệ */}
      {contact.relationshipStatus === "NONE" && (
        <Pressable
          onPress={() => onAddFriend(contact.id)}
          className="px-4 py-1.5 rounded-full active:opacity-80"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-white font-medium">Kết bạn</Text>
          </View>
        </Pressable>
      )}

      {contact.relationshipStatus === "FRIEND" && (
        <Text className="text-gray-500 text-sm">Đã kết bạn</Text>
      )}

      {contact.relationshipStatus === "PENDING_SENT" && (
        <Pressable
          onPress={() => onCancelRequest(contact.friendshipId || "")}
          className="bg-gray-200 px-4 py-1.5 rounded-full active:opacity-80"
        >
          <View className="flex-row items-center gap-1">
            <X size={16} color="gray" />
            <Text className="text-gray-600 font-medium">Hủy lời mời</Text>
          </View>
        </Pressable>
      )}

      {contact.relationshipStatus === "PENDING_RECEIVED" && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => onRejectRequest(contact.friendshipId || "")}
            className="bg-gray-200 px-3 py-1.5 rounded-full active:opacity-80"
          >
            <Text className="text-gray-600 font-medium">Từ chối</Text>
          </Pressable>

          <Pressable
            onPress={() => onAcceptRequest(contact.friendshipId || "")}
            className="px-3 py-1.5 rounded-full active:opacity-80"
            style={{ backgroundColor: Colors.light.PRIMARY_100 }}
          >
            <Text
              className="font-medium"
              style={{ color: Colors.light.PRIMARY_500 }}
            >
              Đồng ý
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default function PhoneContactsScreen() {
  const insets = useSafeAreaInsets();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "notFriends">("all");
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Kết nối đến namespace friends của WebSocket
  const { socket, isConnected, error: socketError } = useSocket("friends");

  // Lấy danh sách liên hệ từ API
  const fetchContacts = useCallback(async (source: string = "manual") => {
    try {
      console.log(`Fetching contacts (source: ${source})`);
      setIsLoading(true);
      setError(null);
      const response = await getContacts();

      // Chuyển đổi dữ liệu từ API sang định dạng DisplayContact
      const formattedContacts = response.map((item) => ({
        id: item.contactUserId,
        fullName:
          item.contactUser.userInfo?.fullName ||
          item.nickname ||
          "Không có tên",
        phoneNumber: item.contactUser.phoneNumber,
        avatarUrl: item.contactUser.userInfo?.profilePictureUrl || null,
        relationshipStatus: item.relationship?.status || "NONE",
        friendshipId: item.relationship?.friendshipId,
      }));

      setContacts(formattedContacts);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Không thể tải danh sách liên hệ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lấy danh sách liên hệ khi component mount
  useEffect(() => {
    fetchContacts("mount");
  }, [fetchContacts]);

  // Refetch contacts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Phone contacts screen focused, refreshing contacts");
      fetchContacts("focus");
      return () => {};
    }, [fetchContacts]),
  );

  // Theo dõi trạng thái kết nối WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log(
        "Socket connected to friends namespace in phone contacts screen",
      );
    } else if (socketError) {
      console.error(
        "Socket connection error in phone contacts screen:",
        socketError,
      );
    }
  }, [isConnected, socketError]);

  // Lắng nghe sự kiện reload từ WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("Setting up reload listener in phone contacts screen");

    // Lắng nghe sự kiện reload
    const handleReload = () => {
      console.log("Received reload event from server, refreshing contacts");
      fetchContacts("websocket");
    };

    socket.on("reload", handleReload);

    // Dọn dẹp listener khi component unmount hoặc socket thay đổi
    return () => {
      console.log("Removing reload listener from phone contacts screen");
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected, fetchContacts]);

  // Đồng bộ danh bạ điện thoại
  const handleUpdateContacts = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      // Yêu cầu quyền truy cập danh bạ
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần quyền truy cập danh bạ để đồng bộ");
        setIsUpdating(false);
        return;
      }

      // Lấy danh bạ từ thiết bị
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length === 0) {
        Alert.alert("Thông báo", "Không tìm thấy liên hệ nào trong danh bạ");
        setIsUpdating(false);
        return;
      }

      // Chuyển đổi dữ liệu sang định dạng API yêu cầu
      const contactsToSync: ContactItemType[] = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0,
        )
        .map((contact) => ({
          name: contact.name || "",
          phone:
            contact.phoneNumbers &&
            contact.phoneNumbers[0] &&
            contact.phoneNumbers[0].number
              ? contact.phoneNumbers[0].number.replace(/\s+/g, "")
              : "",
        }));

      // Gọi API đồng bộ
      const result = await syncContacts(contactsToSync);
      console.log("Sync result:", result);

      // Tải lại danh sách liên hệ
      await fetchContacts();

      // Hiển thị thông báo thành công
      Alert.alert(
        "Thành công",
        `${result.message}\nĐã thêm: ${result.created}\nĐã xóa: ${result.deleted}`,
      );
    } catch (err) {
      console.error("Failed to sync contacts:", err);
      Alert.alert("Lỗi", "Không thể đồng bộ danh bạ. Vui lòng thử lại sau.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý gửi lời mời kết bạn
  const handleAddFriend = (userId: string) => {
    // Tạo introduce tự động
    const introduce =
      "Tôi biết bạn qua danh bạ của tôi. Chúng mình cùng kết nối nhé!";

    // Điều hướng đến trang gửi lời mời kết bạn
    router.push({
      pathname: "/(screens)/(user)/friend/request/[id]" as any,
      params: { id: userId, introduce },
    });
  };

  // Xử lý hủy lời mời kết bạn
  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      // Cập nhật danh sách sau khi hủy lời mời
      fetchContacts("cancel-request");
    } catch (err) {
      console.error("Failed to cancel friend request:", err);
      Alert.alert(
        "Lỗi",
        "Không thể hủy lời mời kết bạn. Vui lòng thử lại sau.",
      );
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest(requestId, "ACCEPTED");
      // Cập nhật danh sách sau khi chấp nhận lời mời
      fetchContacts("accept-request");
    } catch (err) {
      console.error("Failed to accept friend request:", err);
      Alert.alert(
        "Lỗi",
        "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại sau.",
      );
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleRejectRequest = async (requestId: string) => {
    try {
      await respondToFriendRequest(requestId, "DECLINED");
      // Cập nhật danh sách sau khi từ chối lời mời
      fetchContacts("reject-request");
    } catch (err) {
      console.error("Failed to reject friend request:", err);
      Alert.alert(
        "Lỗi",
        "Không thể từ chối lời mời kết bạn. Vui lòng thử lại sau.",
      );
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery);
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "notFriends" &&
        contact.relationshipStatus !== "FRIEND");
    return matchesSearch && matchesFilter;
  });

  const totalContacts = contacts.length;
  const notFriendsCount = contacts.filter(
    (contact) => contact.relationshipStatus !== "FRIEND",
  ).length;
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
      >
        <View
          className="bg-transparent flex-row items-center p-4"
          style={{
            paddingTop: insets.top,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={26} color="white" />
          </Pressable>
          <Text className="ml-4 text-lg font-semibold text-white">
            Danh bạ máy
          </Text>
        </View>
      </LinearGradient>

      {/* Contact list */}
      <ScrollView className="flex-1">
        <View className="p-4 bg-white">
          {/* Search and sync container */}
          <View className="flex-row items-center justify-between gap-3">
            {/* Search bar */}
            <View className="flex-row items-center px-4 py-3 bg-gray-100 rounded-full flex-1">
              <Search size={22} color="gray" />
              <TextInput
                className="flex-1 ml-2.5 text-base"
                placeholder="Tìm kiếm"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Sync button */}
            <Pressable
              onPress={handleUpdateContacts}
              disabled={isUpdating}
              className={`items-center justify-center p-3 rounded-full ${isUpdating ? "bg-gray-100" : ""} active:opacity-80`}
              style={{
                width: 48,
                height: 48,
                backgroundColor: !isUpdating ? Colors.light.PRIMARY_50 : undefined,
              }}
            >
              <RefreshCw
                size={22}
                className={isUpdating ? "animate-spin" : ""}
                color={Colors.light.PRIMARY}
              />
            </Pressable>
          </View>

          {/* Filter tabs */}
          <View className="py-4 flex-row justify-start items-start border-gray-200 border-b-[1px]">
            <Pressable
              className={`py-2 rounded-full mr-2 w-24 active:opacity-80 ${
                activeFilter === "all" ? "bg-gray-200" : "bg-gray-100"
              }`}
              onPress={() => setActiveFilter("all")}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  activeFilter === "all" ? "text-black" : "text-gray-600"
                }`}
              >
                Tất cả ({totalContacts})
              </Text>
            </Pressable>
            <Pressable
              className={`py-2 rounded-full w-32 active:opacity-80 ${
                activeFilter === "notFriends" ? "bg-gray-200" : "bg-gray-100"
              }`}
              onPress={() => setActiveFilter("notFriends")}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  activeFilter === "notFriends" ? "text-black" : "text-gray-600"
                }`}
              >
                Chưa kết bạn ({notFriendsCount})
              </Text>
            </Pressable>
          </View>
        </View>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
            <Text className="text-gray-500 mt-2">Đang tải danh bạ...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-red-500">{error}</Text>
            <Pressable
              onPress={() => fetchContacts("retry")}
              className="mt-4 px-4 py-2 rounded-full active:opacity-80"
              style={{ backgroundColor: Colors.light.PRIMARY_50 }}
            >
              <Text style={{ color: Colors.light.PRIMARY_500 }}>Thử lại</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mt-2">
              {filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  onAddFriend={handleAddFriend}
                  onCancelRequest={handleCancelRequest}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                />
              ))}
            </View>
            {filteredContacts.length === 0 && (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-500">
                  Không tìm thấy liên hệ nào
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
