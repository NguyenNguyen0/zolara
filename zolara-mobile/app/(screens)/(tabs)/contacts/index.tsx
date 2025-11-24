import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { HStack } from "@/components/ui/hstack";
import { useSocket } from "@/hooks/useSocket";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Colors } from "@/constants/Colors";
import {
  Phone,
  Users,
  Contact,
  UserRoundPlus,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { getFriendList } from "@/services/friend-service";
import { groupService, GroupChat } from "@/services/group-service";
import { useConversationsStore } from "@/store/conversationsStore";

// Interface for friend items in UI
interface FriendItem {
  id: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl: string | null;
  email?: string;
}

export default function ContactScreen() {
  // insets được sử dụng trong các phần khác của ứng dụng
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { fetchConversations } = useConversationsStore();

  // Kết nối đến namespace friends của WebSocket
  const { socket, isConnected, error: socketError } = useSocket("friends");

  // Fetch friend list and groups on component mount
  useEffect(() => {
    fetchFriendList("mount");
    fetchUserGroups("mount");
  }, []);

  // Refetch friend list and groups when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("Contacts screen focused, refreshing data");
      fetchFriendList("focus");
      fetchUserGroups("focus");
      return () => {};
    }, []),
  );

  // Theo dõi trạng thái kết nối WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log("Socket connected to friends namespace in contacts screen");
    } else if (socketError) {
      console.error("Socket connection error in contacts screen:", socketError);
    }
  }, [isConnected, socketError]);

  // Lắng nghe sự kiện reload từ WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Lắng nghe sự kiện reload
    const handleReload = () => {
      console.log("Received reload event from server, refreshing data");
      fetchFriendList("websocket");
      fetchUserGroups("websocket");
    };

    socket.on("reload", handleReload);

    // Dọn dẹp listener khi component unmount hoặc socket thay đổi
    return () => {
      console.log("Removing reload listener from contacts screen");
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected]);

  const fetchFriendList = async (source: string = "manual") => {
    try {
      console.log(`Fetching friend list (source: ${source})`);
      setIsLoading(true);
      setError(null);
      const response = await getFriendList();

      // Chuyển đổi dữ liệu từ API sang định dạng FriendItem
      const formattedFriends = response.map((item) => ({
        id: item.friend.id,
        fullName: item.friend.userInfo?.fullName || "Không có tên",
        phoneNumber: item.friend.phoneNumber,
        avatarUrl: item.friend.userInfo?.profilePictureUrl || null,
        email: item.friend.email,
      }));

      setFriends(formattedFriends);
    } catch (err) {
      console.error("Failed to fetch friend list:", err);
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserGroups = async (source: string = "manual") => {
    try {
      console.log(`Fetching user groups (source: ${source})`);
      setIsLoadingGroups(true);
      setGroupError(null);
      const response = await groupService.getUserGroups();
      setGroups(response);
    } catch (err) {
      console.error("Failed to fetch user groups:", err);
      setGroupError("Không thể tải danh sách nhóm. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const groupedFriends = friends.reduce(
    (acc, friend) => {
      const firstLetter = friend.fullName[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(friend);
      return acc;
    },
    {} as Record<string, FriendItem[]>,
  );

  const sortedLetters = Object.keys(groupedFriends).sort();

  const FriendItem = ({ friend }: { friend: FriendItem }) => {
    const handleViewProfile = () => {
      router.push({
        pathname: "/(screens)/(user)/info/[id]" as any,
        params: { id: friend.id },
      });
    };

    return (
      <Pressable
        className="flex flex-row my-2 items-center justify-between px-4 py-2"
        onPress={handleViewProfile}
      >
        <HStack className="items-center flex-1">
          <Avatar size="lg">
            <AvatarFallbackText>{friend.fullName}</AvatarFallbackText>
            {friend.avatarUrl && (
              <AvatarImage source={{ uri: friend.avatarUrl }} />
            )}
          </Avatar>
          <Text className="ml-4 text-lg ">{friend.fullName}</Text>
        </HStack>
        <HStack className="space-x-4">
          {/*
          <Pressable
            onPress={() => Alert.alert("Coming Soon")}
            className="pr-4"
          >
            <Phone size={24} color={"gray"} strokeWidth={1.5} />
          </Pressable>
          */}
          {/*
          <Pressable onPress={() => Alert.alert("Coming Soon")} className="px-2.5">
            <Video size={26} color={"gray"} strokeWidth={1.5} />
          </Pressable>
          */}
        </HStack>
      </Pressable>
    );
  };

  const FunctionButton = ({ icon, title, onPress, subtitle }: any) => (
    <Pressable
      className="flex-row items-center px-4 py-4 bg-white"
      onPress={onPress}
    >
      {icon}
      <View className="ml-4">
        <Text className="text-lg text-gray-600">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-400">{subtitle}</Text>}
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top }}>
      <HStack className=" px-4  bg-white">
        {/* WebSocket connection indicator */}
        <Pressable
          className="flex-1 py-3"
          style={
            activeTab === "friends"
              ? {
                  borderBottomWidth: 3,
                  borderBottomColor: Colors.light.PRIMARY_500,
                  backgroundColor: Colors.light.PRIMARY_50,
                }
              : undefined
          }
          onPress={() => setActiveTab("friends")}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "friends" ? "" : "text-gray-500"}`}
            style={
              activeTab === "friends"
                ? { color: Colors.light.PRIMARY_600, fontWeight: "600" }
                : undefined
            }
          >
            Bạn bè
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 py-3"
          style={
            activeTab === "groups"
              ? {
                  borderBottomWidth: 3,
                  borderBottomColor: Colors.light.PRIMARY_500,
                  backgroundColor: Colors.light.PRIMARY_50,
                }
              : undefined
          }
          onPress={() => setActiveTab("groups")}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "groups" ? "" : "text-gray-500"}`}
            style={
              activeTab === "groups"
                ? { color: Colors.light.PRIMARY_600, fontWeight: "600" }
                : undefined
            }
          >
            Nhóm
          </Text>
        </Pressable>
      </HStack>
      <View className="h-1 bg-gray-100" />
      {activeTab === "friends" ? (
        <ScrollView className="bg-white">
          <VStack className="mt-2">
            <FunctionButton
              icon={
                <UserRoundPlus
                  size={26}
                  color={Colors.light.PRIMARY}
                  strokeWidth={1.5}
                />
              }
              title="Lời mời kết bạn"
              onPress={() =>
                router.push("/(screens)/(user)/friend/request" as any)
              }
            />
            <FunctionButton
              icon={
                <Contact
                  size={26}
                  color={Colors.light.PRIMARY}
                  strokeWidth={1.5}
                />
              }
              title="Danh bạ"
              subtitle="Liên hệ có dùng Zolara"
              onPress={() =>
                router.push("/(screens)/(user)/friend/phoneContacts" as any)
              }
            />
          </VStack>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
              <Text className="text-gray-500 mt-2">
                Đang tải danh sách bạn bè...
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-red-500">{error}</Text>
              <Pressable
                onPress={() => fetchFriendList("retry")}
                className="mt-4 px-4 py-2 rounded-full"
                style={{ backgroundColor: Colors.light.PRIMARY_50 }}
              >
                <Text style={{ color: Colors.light.PRIMARY_500 }}>Thử lại</Text>
              </Pressable>
            </View>
          ) : (
            <VStack className="mt-4">
              {sortedLetters.length > 0 ? (
                sortedLetters.map((letter) => (
                  <View key={letter}>
                    <Text className="px-4 py-2 text-md text-gray-500 bg-gray-100">
                      {letter}
                    </Text>
                    {groupedFriends[letter].map((friend) => (
                      <FriendItem key={friend.id} friend={friend} />
                    ))}
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-8">
                  <Text className="text-gray-500">Không có bạn bè nào</Text>
                </View>
              )}
            </VStack>
          )}
        </ScrollView>
      ) : (
        <ScrollView className="bg-white">
          <Pressable
            className="flex-row items-center px-4 py-3 bg-white"
            onPress={() => router.push("/(screens)/(user)/group/create" as any)}
          >
            <View
              className="items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: Colors.light.PRIMARY_50 }}
            >
              <Users size={24} color={Colors.light.PRIMARY} />
            </View>
            <Text className="ml-4 text-md text-gray-600">Tạo nhóm mới</Text>
          </Pressable>

          {isLoadingGroups ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
              <Text className="text-gray-500 mt-2">
                Đang tải danh sách nhóm...
              </Text>
            </View>
          ) : groupError ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-red-500">{groupError}</Text>
              <Pressable
                onPress={() => fetchUserGroups("retry")}
                className="mt-4 px-4 py-2 rounded-full"
                style={{ backgroundColor: Colors.light.PRIMARY_50 }}
              >
                <Text style={{ color: Colors.light.PRIMARY_500 }}>Thử lại</Text>
              </Pressable>
            </View>
          ) : groups.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">Bạn chưa tham gia nhóm nào</Text>
            </View>
          ) : (
            <View className="mt-1 pb-10">
              {groups.map((group) => (
                <Pressable
                  key={group.id}
                  className="flex-row items-center px-4 py-3 border-b border-gray-100"
                  onPress={() =>
                    router.push({
                      pathname: "../chat/[id]",
                      params: {
                        id: group.id,
                        type: "GROUP",
                        name: group.name,
                        avatarUrl: group.avatarUrl || undefined,
                      },
                    })
                  }
                >
                  <Avatar size="lg">
                    <AvatarFallbackText>{group.name}</AvatarFallbackText>
                    {group.avatarUrl && (
                      <AvatarImage source={{ uri: group.avatarUrl }} />
                    )}
                  </Avatar>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-medium">{group.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {group.memberCount} thành viên
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
