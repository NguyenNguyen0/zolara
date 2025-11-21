import React, { useState, useEffect, useRef } from "react";
import CustomToastRed from "@/components/CustomToastRed";
import CustomToast from "@/components/CustomToast";
import QRCode from "react-native-qrcode-svg";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  ArrowLeft,
  Edit2,
  UserPlus,
  LogOut,
  Trash2,
  Camera,
  Phone,
  MessageSquare,
  X,
  User,
  ShieldAlert,
  Home,
  QrCode,
  Search,
  MoreVertical,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { groupService } from "@/services/group-service";
import { getFriendList, Friend } from "@/services/friend-service";
// Removed unused imports
import { Group, GroupMember } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Socket } from "socket.io-client";
import { socketManager } from "@/lib/socket";
import axiosInstance from "@/lib/axios";

export default function GroupInfoScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id;
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRedToast, setShowRedToast] = useState(false);
  const [showBlueToast, setShowBlueToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<ExtendedGroupMember | null>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const [showTransferLeadershipModal, setShowTransferLeadershipModal] =
    useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [addMembersLoading, setAddMembersLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Thiết lập kết nối socket và lắng nghe sự kiện
  useEffect(() => {
    if (!groupId || !currentUser?.userId) return;

    const setupSocket = async () => {
      try {
        console.log("[SOCKET] Starting socket setup for group:", groupId);
        console.log("[SOCKET] Current user ID:", currentUser?.userId);

        // Lấy URL API từ biến môi trường
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error("[SOCKET] EXPO_PUBLIC_API_URL is not defined in .env file");
          return;
        }
        console.log("[SOCKET] Original API URL:", apiUrl);

        // Loại bỏ "/api/v1" để lấy URL cơ sở
        const baseUrl = apiUrl.includes("/api/v1")
          ? apiUrl.replace("/api/v1", "")
          : apiUrl;
        console.log("[SOCKET] Base URL after processing:", baseUrl);

        // Kết nối với namespace /groups
        console.log("[SOCKET] Attempting to connect to namespace 'groups'...");
        const socket = await socketManager.connectToNamespace("groups");
        console.log(
          "[SOCKET] Socket connection result:",
          socket ? "Success" : "Failed",
        );

        if (socket) {
          console.log("[SOCKET] Socket ID:", socket.id);
          console.log("[SOCKET] Socket connected status:", socket.connected);
          socketRef.current = socket;

          // Tham gia vào phòng nhóm
          console.log("[SOCKET] Joining group room with data:", {
            userId: currentUser.userId,
            groupId,
          });
          socket.emit("joinGroup", { userId: currentUser.userId, groupId });

          // Tham gia vào phòng cá nhân của người dùng để nhận các sự kiện cá nhân
          console.log(
            "[SOCKET] Joining user room with userId:",
            currentUser.userId,
          );
          socket.emit("joinUserRoom", { userId: currentUser.userId });

          // Lắng nghe sự kiện xác nhận tham gia phòng nhóm
          socket.on("joinedGroup", (data) => {
            console.log("[SOCKET] Joined group confirmation received:", data);
          });

          // Lắng nghe sự kiện xác nhận tham gia phòng cá nhân
          socket.on("joinedUserRoom", (data) => {
            console.log(
              "[SOCKET] Joined user room confirmation received:",
              data,
            );
          });

          // Thêm sự kiện connect và disconnect để debug
          socket.on("connect", () => {
            console.log(
              "[SOCKET] Socket connected event fired, ID:",
              socket.id,
            );
            // Thử tham gia lại phòng nhóm và phòng cá nhân sau khi kết nối
            socket.emit("joinGroup", { userId: currentUser.userId, groupId });
            socket.emit("joinUserRoom", { userId: currentUser.userId });
          });

          socket.on("disconnect", (reason) => {
            console.log("[SOCKET] Socket disconnected, reason:", reason);
          });

          socket.on("connect_error", (error) => {
            console.log("[SOCKET] Connection error:", error.message);
          });

          // Thêm sự kiện ping/pong để kiểm tra kết nối
          socket.on("pong", (data) => {
            console.log("[SOCKET] Received pong from server:", data);
          });

          // Gửi ping để kiểm tra kết nối
          socket.emit(
            "ping",
            { message: "Hello from client" },
            (response: any) => {
              console.log("[SOCKET] Ping response:", response);
            },
          );

          // Lắng nghe sự kiện cập nhật nhóm
          console.log("[SOCKET] Setting up groupUpdated listener");
          socket.on("groupUpdated", (data) => {
            console.log("[SOCKET] Group updated event received:", data);
            if (data.groupId === groupId) {
              console.log(
                "[SOCKET] Updating group details due to groupUpdated event",
              );
              fetchGroupDetails();
            }
          });

          // Lắng nghe sự kiện thêm thành viên
          console.log("[SOCKET] Setting up memberAdded listener");
          socket.on("memberAdded", (data) => {
            console.log("[SOCKET] Member added event received:", data);
            if (data.groupId === groupId) {
              console.log(
                "[SOCKET] Updating group details due to memberAdded event",
              );
              fetchGroupDetails();

              // Hiển thị thông báo nếu không phải người dùng hiện tại thêm
              if (data.addedById !== currentUser.userId) {
                setToastMessage("Có thành viên mới được thêm vào nhóm");
                setShowBlueToast(true);
              }
            }
          });

          // Lắng nghe sự kiện xóa thành viên
          console.log("[SOCKET] Setting up memberRemoved listener");
          socket.on("memberRemoved", (data) => {
            console.log("[SOCKET] Member removed event received:", data);
            if (data.groupId === groupId) {
              console.log("[SOCKET] Group ID matches current group");

              // Nếu người bị xóa là người dùng hiện tại, chuyển hướng về màn hình chính
              if (data.userId === currentUser.userId) {
                console.log("[SOCKET] Current user was removed from the group");
                // Hiển thị thông báo
                let message = "Bạn đã bị xóa khỏi nhóm";
                if (data.left) {
                  message = "Bạn đã rời khỏi nhóm";
                } else if (data.kicked) {
                  message = "Bạn đã bị đuổi khỏi nhóm";
                }

                console.log("[SOCKET] Showing toast message:", message);
                setToastMessage(message);
                setShowRedToast(true);

                // Chuyển hướng ngay lập tức về màn hình chính
                console.log("[SOCKET] Navigating to home screen");
                router.replace("/(screens)/(tabs)" as any);
              } else {
                // Nếu là thành viên khác bị xóa, cập nhật lại danh sách thành viên
                console.log(
                  "[SOCKET] Another member was removed, updating group details",
                );
                fetchGroupDetails();

                // Hiển thị thông báo
                setToastMessage("Một thành viên đã bị xóa khỏi nhóm");
                setShowRedToast(true);
              }
            }
          });

          // Lắng nghe sự kiện thay đổi vai trò
          console.log("[SOCKET] Setting up roleChanged listener");
          socket.on("roleChanged", (data) => {
            console.log("[SOCKET] Role changed event received:", data);
            if (data.groupId === groupId) {
              console.log(
                "[SOCKET] Updating group details due to roleChanged event",
              );
              fetchGroupDetails();

              // Hiển thị thông báo nếu là người dùng hiện tại
              if (data.userId === currentUser.userId) {
                let roleMessage = "";
                if (data.role === "LEADER") {
                  roleMessage = "Bạn đã trở thành trưởng nhóm";
                } else if (data.role === "CO_LEADER") {
                  roleMessage = "Bạn đã trở thành phó nhóm";
                } else if (data.role === "MEMBER") {
                  roleMessage =
                    "Vai trò của bạn đã được thay đổi thành thành viên";
                }

                setToastMessage(roleMessage);
                setShowBlueToast(true);
              }
            }
          });

          // Lắng nghe sự kiện cập nhật avatar
          console.log("[SOCKET] Setting up avatarUpdated listener");
          socket.on("avatarUpdated", (data) => {
            console.log("[SOCKET] Avatar updated event received:", data);
            if (data.groupId === groupId) {
              console.log(
                "[SOCKET] Updating group details due to avatarUpdated event",
              );
              fetchGroupDetails();
            }
          });

          // Lắng nghe sự kiện bị xóa khỏi nhóm
          console.log("[SOCKET] Setting up removedFromGroup listener");
          socket.on("removedFromGroup", (data) => {
            console.log("[SOCKET] Removed from group event received:", data);
            if (data.groupId === groupId) {
              console.log("[SOCKET] Current user was removed from the group");

              // Hiển thị thông báo
              let message = "Bạn đã bị xóa khỏi nhóm";
              if (data.left) {
                message = "Bạn đã rời khỏi nhóm";
              } else if (data.kicked) {
                message = "Bạn đã bị đuổi khỏi nhóm";
              }

              setToastMessage(message);
              setShowRedToast(true);

              // Chuyển hướng ngay lập tức về màn hình chính
              router.replace("/(screens)/(tabs)");
            }
          });

          // Lắng nghe sự kiện nhóm bị giải tán - phương pháp 1: trực tiếp
          console.log("[SOCKET] Setting up groupDissolved listener");
          socket.on("groupDissolved", (data) => {
            console.log("[SOCKET] Group dissolved event received:", data);
            if (data.groupId === groupId) {
              console.log("[SOCKET] Group was dissolved");
              handleGroupDissolvedEvent(data);
            }
          });

          // Lắng nghe sự kiện nhóm bị giải tán - phương pháp 2: broadcast
          console.log("[SOCKET] Setting up groupDissolvedBroadcast listener");
          socket.on("groupDissolvedBroadcast", (data) => {
            console.log("[SOCKET] Group dissolved broadcast received:", data);
            // Kiểm tra xem broadcast có dành cho người dùng hiện tại không
            if (
              data.targetUserId === currentUser?.userId &&
              data.groupId === groupId
            ) {
              console.log(
                "[SOCKET] Group dissolved broadcast is for current user",
              );
              handleGroupDissolvedEvent(data);
            }
          });

          // Hàm xử lý sự kiện nhóm bị giải tán
          const handleGroupDissolvedEvent = (data: any) => {
            // Hiển thị thông báo chi tiết hơn
            const dissolvedBy =
              data.dissolvedBy === currentUser?.userId ? "bạn" : "trưởng nhóm";
            setToastMessage(
              `Nhóm ${data.groupName || ""} đã bị giải tán bởi ${dissolvedBy}`,
            );
            setShowRedToast(true);

            // Cập nhật danh sách cuộc trò chuyện
            try {
              const conversationsStore =
                require("@/store/conversationsStore").useConversationsStore.getState();
              conversationsStore.fetchConversations(1);
              console.log(
                "[SOCKET] Đã gọi cập nhật danh sách cuộc trò chuyện sau khi nhóm bị giải tán",
              );
            } catch (storeError) {
              console.error(
                "[SOCKET] Lỗi khi cập nhật danh sách cuộc trò chuyện:",
                storeError,
              );
            }

            // Chuyển hướng về màn hình chính sau một khoảng thời gian ngắn
            setTimeout(() => {
              console.log(
                "[SOCKET] Chuyển hướng về màn hình chính sau khi nhóm bị giải tán",
              );
              router.replace("/(screens)/(tabs)");
            }, 1000);
          };

          // Thêm sự kiện lắng nghe bất kỳ để debug
          socket.onAny((event, ...args) => {
            console.log(`[SOCKET] Received event '${event}':`, args);
          });

          console.log("[SOCKET] All event listeners set up successfully");
        } else {
          console.log(
            "[SOCKET] Failed to get socket instance from socketManager",
          );
        }
      } catch (error) {
        console.error("[SOCKET] Error setting up socket connection:", error);
      }
    };

    setupSocket();

    // Fetch group details
    fetchGroupDetails();

    // Cleanup function
    return () => {
      console.log("[SOCKET] Component unmounting, cleaning up socket");
      if (socketRef.current) {
        console.log(
          "[SOCKET] Socket exists, removing listeners and disconnecting",
        );
        // Remove all listeners
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.off("pong");
        socketRef.current.off("joinedGroup");
        socketRef.current.off("joinedUserRoom");
        socketRef.current.off("groupUpdated");
        socketRef.current.off("memberAdded");
        socketRef.current.off("memberRemoved");
        socketRef.current.off("roleChanged");
        socketRef.current.off("avatarUpdated");
        socketRef.current.off("removedFromGroup");
        socketRef.current.off("groupDissolved");
        socketRef.current.off("groupDissolvedBroadcast");
        socketRef.current.offAny();

        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("[SOCKET] Socket cleanup complete");
      } else {
        console.log("[SOCKET] No socket to clean up");
      }
    };
  }, [groupId, currentUser?.userId]);

  // Không cần useEffect chuyển hướng nữa vì đã chuyển hướng trực tiếp

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      // Sử dụng groupService để lấy thông tin nhóm
      const groupData = await groupService.getGroupDetails(groupId);

      try {
        // Phương pháp 1: Sử dụng groupService.getGroupDetails
        const groupData = await groupService.getGroupDetails(groupId);

        if (groupData) {
          setGroup(groupData);
          setNewGroupName(groupData.name);
          return; // Thoát khỏi hàm nếu thành công
        }
      } catch (serviceError) {
        console.error("Error using groupService:", serviceError);
      }

      try {
        // Phương pháp 2: Gọi trực tiếp API
        const token = await SecureStore.getItemAsync("accessToken");
        console.log(
          "Trying direct API call with token:",
          token ? "Token exists" : "No token",
        );

        // Thử gọi API với đường dẫn từ .env
        const response = await axiosInstance.get(`/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Direct API call status:", response.status);
        const directData = response.data;
        console.log("Direct API data:", directData);

        if (directData) {
          setGroup(directData);
          setNewGroupName(directData.name);
        }
      } catch (directError) {
        console.error("Error with direct API call:", directError);
        throw directError; // Re-throw để xử lý ở catch bên ngoài
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !group) return;

    setIsUpdating(true);
    try {
      const updatedGroup = await groupService.updateGroup(groupId, {
        name: newGroupName,
      });
      if (updatedGroup) {
        setGroup(updatedGroup);
        setShowEditNameModal(false);

        // Hiển thị thông báo thành công
        setToastMessage("Đã cập nhật tên nhóm thành công");
        setShowBlueToast(true);
      }
    } catch (error) {
      console.error("Error updating group name:", error);
      Alert.alert("Lỗi", "Không thể cập nhật tên nhóm");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateGroupAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Cần quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện nhóm",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], //"images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "group_avatar.jpg",
        } as any);

        const updatedGroup = await groupService.updateGroupAvatar(
          groupId,
          formData,
        );
        if (updatedGroup) {
          setGroup(updatedGroup);

          // Hiển thị thông báo thành công
          setToastMessage("Đã cập nhật ảnh đại diện nhóm thành công");
          setShowBlueToast(true);
        }
      } catch (error) {
        console.error("Error updating group avatar:", error);
        Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện nhóm");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleLeaveGroup = () => {
    // Kiểm tra xem nhóm có chỉ còn 1 thành viên hay không
    if (isLastMember) {
      // Nếu chỉ còn 1 thành viên, gợi ý giải tán nhóm
      Alert.alert(
        "Không thể rời nhóm",
        "Bạn là thành viên duy nhất còn lại trong nhóm. Bạn có muốn giải tán nhóm không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Giải tán nhóm",
            style: "destructive",
            onPress: handleDeleteGroup,
          },
        ],
      );
      return;
    }

    // Kiểm tra xem người dùng có phải là trưởng nhóm không
    if (isGroupLeader) {
      // Nếu là trưởng nhóm, yêu cầu chuyển quyền trước
      Alert.alert(
        "Không thể rời nhóm",
        "Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Chuyển quyền ngay",
            onPress: handleTransferLeadership,
          },
        ],
      );
      return;
    }

    // Nếu không phải trưởng nhóm, cho phép rời nhóm bình thường
    Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời nhóm",
        style: "destructive",
        onPress: async () => {
          setIsUpdating(true);
          try {
            try {
              // Gọi API rời nhóm
              await groupService.leaveGroup(groupId);

              // Hiển thị thông báo rời nhóm thành công

              setToastMessage("Rời nhóm thành công");
              setShowRedToast(true);

              // Chờ 1 giây rồi chuyển hướng về màn hình chính

              setTimeout(() => {
                router.replace("/(screens)/(tabs)" as any);
              }, 1000);

              // Cập nhật danh sách cuộc trò chuyện (không chờ kết quả)
              try {
                const conversationsStore =
                  require("@/store/conversationsStore").useConversationsStore.getState();
                conversationsStore.fetchConversations(1);
                console.log(
                  "Bước 5: Đã gọi cập nhật danh sách cuộc trò chuyện",
                );
              } catch (storeError) {
                console.error(
                  "Lỗi khi cập nhật danh sách cuộc trò chuyện:",
                  storeError,
                );
              }
            } catch (apiError: any) {
              console.error(
                "Lỗi khi gọi API rời nhóm:",
                apiError?.response?.status,
                apiError?.response?.data || apiError.message,
              );
              throw apiError; // Chuyển tiếp lỗi để xử lý ở catch bên ngoài
            }
          } catch (error: any) {
            console.error("Error leaving group:", error);

            // Kiểm tra nếu lỗi là 403 (Forbidden) - trường hợp trưởng nhóm cố gắng rời nhóm
            if (error.response && error.response.status === 403) {
              Alert.alert(
                "Không thể rời nhóm",
                "Bạn đang là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Chuyển quyền ngay",
                    onPress: handleTransferLeadership,
                  },
                ],
              );
            } else {
              Alert.alert("Lỗi", "Không thể rời khỏi nhóm");
            }
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Xóa nhóm",
      "Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa nhóm",
          style: "destructive",
          onPress: async () => {
            setIsUpdating(true);
            try {
              try {
                // Gọi API xóa nhóm
                await groupService.deleteGroup(groupId);

                setToastMessage("Xóa nhóm thành công");
                setShowRedToast(true);

                setTimeout(() => {
                  router.replace("/(screens)/(tabs)" as any);
                }, 1000);

                // Cập nhật danh sách cuộc trò chuyện (không chờ kết quả)
                try {
                  const conversationsStore =
                    require("@/store/conversationsStore").useConversationsStore.getState();
                  conversationsStore.fetchConversations(1);
                } catch (storeError) {
                  console.error(
                    "Lỗi khi cập nhật danh sách cuộc trò chuyện:",
                    storeError,
                  );
                }
              } catch (apiError: any) {
                console.error(
                  "Lỗi khi gọi API xóa nhóm:",
                  apiError?.response?.status,
                  apiError?.response?.data || apiError.message,
                );
                throw apiError; // Chuyển tiếp lỗi để xử lý ở catch bên ngoài
              }
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert("Lỗi", "Không thể xóa nhóm");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleTransferLeadership = () => {
    Alert.alert(
      "Chuyển quyền trưởng nhóm",
      "Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý nhóm. Bạn sẽ mất quyền quản lý nhưng vẫn là 1 thành viên của nhóm. Hành động này không thể phục hồi.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tiếp tục",
          onPress: () => {
            // Hiển thị modal chọn thành viên
            setShowTransferLeadershipModal(true);
          },
        },
      ],
    );
  };

  const handleConfirmTransferLeadership = async (
    member: ExtendedGroupMember,
  ) => {
    setShowTransferLeadershipModal(false);

    Alert.alert(
      `Chuyển quyền trưởng nhóm cho ${member.fullName}?`,
      `${member.fullName} sẽ trở thành trưởng nhóm. Bạn sẽ trở thành 1 thành viên bình thường.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chuyển",
          onPress: async () => {
            try {
              setIsUpdating(true);

              // Gọi API để cập nhật vai trò thành viên
              await groupService.updateMemberRole(
                groupId,
                member.userId,
                "LEADER",
              );

              // Hiển thị thông báo thành công
              // Hiển thị thông báo chuyển quyền thành công
              setToastMessage(
                `Đã chuyển quyền trưởng nhóm cho ${member.fullName}`,
              );
              setShowBlueToast(true);

              // Cập nhật lại thông tin nhóm
              await fetchGroupDetails();

              // Hiển thị thông báo thành công
              Alert.alert(
                "Thành công",
                `Đã chuyển quyền trưởng nhóm cho ${member.fullName}.`,
                [{ text: "OK" }],
              );
            } catch (error) {
              console.error("Error transferring leadership:", error);
              Alert.alert("Lỗi", "Không thể chuyển quyền trưởng nhóm");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const isGroupLeader =
    group?.members?.some(
      (member) =>
        member.userId === currentUser?.userId && member.role === "LEADER",
    ) || false;

  const isGroupCoLeader =
    group?.members?.some(
      (member) =>
        member.userId === currentUser?.userId && member.role === "CO_LEADER",
    ) || false;

  const canManageMembers = isGroupLeader || isGroupCoLeader;

  // Kiểm tra xem nhóm có chỉ còn 1 thành viên hay không
  const isLastMember = group?.members?.length === 1;

  // Sử dụng type casting để phù hợp với cấu trúc dữ liệu mới
  interface ExtendedGroupMember extends GroupMember {
    fullName?: string;
    profilePictureUrl?: string;
    addedBy?: {
      id: string;
      fullName: string;
    };
  }

  const renderMemberItem = ({ item }: { item: ExtendedGroupMember }) => {
    // Trong cấu trúc dữ liệu mới, thông tin người dùng được đưa trực tiếp vào đối tượng thành viên
    const fullName = item.fullName || "Không có tên";
    const profilePictureUrl = item.profilePictureUrl;
    const addedBy = item.addedBy?.fullName || "";

    // Kiểm tra xem có phải là người dùng hiện tại không
    const isCurrentUser = item.userId === currentUser?.userId;

    return (
      <TouchableOpacity
        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
        onPress={() => {
          // Chỉ hiển thị thông tin khi nhấn vào thành viên khác
          if (!isCurrentUser) {
            setSelectedMember(item);
            setShowMemberInfo(true);
          }
        }}
        disabled={isCurrentUser}
        activeOpacity={isCurrentUser ? 1 : 0.7}
      >
        <HStack className="items-center">
          <Avatar size="md">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} />
            ) : (
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            )}
          </Avatar>
          <VStack className="ml-3 flex-1">
            <Text className="text-base font-medium text-gray-900">
              {fullName}
              {isCurrentUser ? " (Bạn)" : ""}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {item.role === "LEADER"
                ? "Trưởng nhóm"
                : item.role === "CO_LEADER"
                  ? "Phó nhóm"
                  : "Thành viên"}
            </Text>
            {addedBy && item.role !== "LEADER" && (
              <Text className="text-xs text-gray-400 mt-0.5">
                Thêm bởi: {addedBy}
              </Text>
            )}
          </VStack>

          {/* Cho phép cả trưởng nhóm và phó nhóm đuổi thành viên, nhưng không thể đuổi trưởng nhóm */}
          {canManageMembers &&
            item.userId !== currentUser?.userId &&
            item.role !== "LEADER" && (
              <TouchableOpacity
                className="p-2 ml-2"
                onPress={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện lan tỏa đến TouchableOpacity cha
                  Alert.alert(
                    "Xóa thành viên",
                    `Bạn có chắc chắn muốn xóa ${(item as ExtendedGroupMember).fullName || "thành viên này"} khỏi nhóm?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Xóa",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await groupService.removeMember(
                              groupId,
                              item.userId,
                            );
                            fetchGroupDetails();
                          } catch (error) {
                            console.error("Error removing member:", error);
                            Alert.alert("Lỗi", "Không thể xóa thành viên");
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <Trash2 size={20} color={"#EF4444"} />
              </TouchableOpacity>
            )}
        </HStack>
      </TouchableOpacity>
    );
  };

  // Không cần màn hình loading nữa vì đã chuyển hướng trực tiếp

  return (
    <View className="flex-1 bg-white">
      {showRedToast && (
        <CustomToastRed
          message={toastMessage}
          onHide={() => setShowRedToast(false)}
        />
      )}
      {showBlueToast && (
        <CustomToast
          message={toastMessage}
          onHide={() => setShowBlueToast(false)}
        />
      )}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
        style={{
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <HStack className="p-2.5 border-b border-gray-200 justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-semibold mr-4">
            Thông tin nhóm
          </Text>
          {/* <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Home size={24} color={"white"} />
          </TouchableOpacity> */}
        </HStack>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
        </View>
      ) : group ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Group Info Section */}
          <View className="bg-white">
            <VStack className="py-6 px-4 items-center">
              <TouchableOpacity
                onPress={handleUpdateGroupAvatar}
                disabled={!isGroupLeader || isUpdating}
                className="relative mb-4"
              >
                <Avatar size="xl">
                  {group?.avatarUrl ? (
                    <AvatarImage source={{ uri: group?.avatarUrl || "" }} />
                  ) : (
                    <AvatarFallbackText>
                      {group?.name || "Nhóm"}
                    </AvatarFallbackText>
                  )}
                </Avatar>
                {isGroupLeader && (
                  <View
                    className="absolute bottom-0 right-0 rounded-full p-1.5 border-2 border-white"
                    style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                  >
                    <Camera size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              <HStack className="items-center mb-2">
                <Text className="text-2xl font-bold text-center">
                  {group?.name || ""}
                </Text>
                {isGroupLeader && (
                  <TouchableOpacity
                    onPress={() => {
                      setNewGroupName(group?.name || "");
                      setShowEditNameModal(true);
                    }}
                    className="ml-2 p-1"
                  >
                    <Edit2 size={18} color={Colors.light.PRIMARY} />
                  </TouchableOpacity>
                )}
              </HStack>

              <Text className="text-sm text-gray-500">
                {group?.members?.length || 0} thành viên
              </Text>
            </VStack>
          </View>

          {/* Members List Section */}
          <View className="bg-white mt-2">
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <HStack className="justify-between items-center">
                <Text className="text-base font-semibold text-gray-800">
                  Thành viên nhóm
                </Text>
                <TouchableOpacity
                  className="flex-row items-center px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: Colors.light.PRIMARY_500 + "15" }}
                  onPress={handleOpenAddMembersModal}
                >
                  <UserPlus size={18} color={Colors.light.PRIMARY} />
                  <Text
                    className="ml-1.5 font-medium"
                    style={{ color: Colors.light.PRIMARY_500 }}
                  >
                    Thêm
                  </Text>
                </TouchableOpacity>
              </HStack>
            </View>

            <View className="bg-white">
              <FlatList
                data={group?.members || []}
                keyExtractor={(item) => item.id}
                renderItem={renderMemberItem}
                contentContainerStyle={{ paddingVertical: 8 }}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />
            </View>
          </View>

          {/* Actions Section - Button to open modal */}
          <View className="bg-white mt-2 mb-6">
            <View className="px-4 py-4">
              <TouchableOpacity
                onPress={() => setShowActionsModal(true)}
                className="flex-row items-center justify-center py-4 rounded-xl border-2 border-dashed"
                style={{ borderColor: Colors.light.PRIMARY_500 + "40" }}
              >
                <MoreVertical size={22} color={Colors.light.PRIMARY} />
                <Text
                  className="ml-2 text-base font-semibold"
                  style={{ color: Colors.light.PRIMARY_500 }}
                >
                  Tùy chọn nhóm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>Không tìm thấy thông tin nhóm</Text>
        </View>
      )}

      {isUpdating && (
        <View className="absolute inset-0 bg-black bg-opacity-30 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Modal thông tin thành viên */}
      <Modal
        visible={showMemberInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMemberInfo(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{
            backgroundColor: "rgba(148, 163, 184, 0.3)",
          }} /* Màu slate-400 với độ trong suốt 30% */
          onPress={() => setShowMemberInfo(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-2">
                Thông tin thành viên
              </Text>

              <TouchableOpacity
                className="absolute right-0 top-0"
                onPress={() => setShowMemberInfo(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <View className="items-center">
                <Avatar size="xl" className="mb-4">
                  {selectedMember.profilePictureUrl ? (
                    <AvatarImage
                      source={{ uri: selectedMember.profilePictureUrl }}
                    />
                  ) : (
                    <AvatarFallbackText>
                      {selectedMember.fullName || ""}
                    </AvatarFallbackText>
                  )}
                </Avatar>

                <Text className="text-xl font-bold mb-1">
                  {selectedMember.fullName}
                </Text>
                <Text className="text-gray-500 mb-4">
                  {selectedMember.role === "LEADER"
                    ? "Trưởng nhóm"
                    : selectedMember.role === "CO_LEADER"
                      ? "Phó nhóm"
                      : "Thành viên"}
                </Text>

                <View className="w-full">
                  <TouchableOpacity
                    className="flex-row items-center py-4 border-t border-gray-200"
                    onPress={() => {
                      setShowMemberInfo(false); // Đóng modal thông tin thành viên
                      // Điều hướng đến trang thông tin cá nhân của thành viên
                      router.push({
                        pathname: "/(screens)/(user)/info/[id]" as any,
                        params: { id: selectedMember.userId },
                      });
                    }}
                  >
                    <User size={20} color={Colors.light.PRIMARY} />
                    <Text className="ml-3 text-base">Xem trang cá nhân</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center py-4 border-t border-gray-200"
                    onPress={() => {
                      setShowMemberInfo(false); // Đóng modal thông tin thành viên
                      // Điều hướng đến trang chat với thành viên
                      router.push({
                        pathname: "/(screens)/(user)/chat/[id]" as any,
                        params: {
                          id: selectedMember.userId,
                          name: selectedMember.fullName || "Thành viên",
                          avatarUrl: selectedMember.profilePictureUrl || "",
                          type: "USER",
                        },
                      });
                    }}
                  >
                    <MessageSquare
                      size={20}
                      color={Colors.light.PRIMARY}
                    />
                    <Text className="ml-3 text-base">Nhắn tin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center py-4 border-t border-gray-200"
                    disabled={true}
                    activeOpacity={0.5}
                  >
                    <Phone size={20} color="#9CA3AF" /* gray-400 */ />
                    <View className="flex-row items-center">
                      <Text className="ml-3 text-base text-gray-400">
                        Gọi điện
                      </Text>
                      <Text className="ml-2 text-xs text-gray-400 italic">
                        (Chưa khả dụng)
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Bổ nhiệm làm phó nhóm */}
                  {isGroupLeader &&
                    selectedMember.role !== "LEADER" &&
                    selectedMember.role !== "CO_LEADER" && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Bổ nhiệm làm phó nhóm",
                            `Bạn có muốn bổ nhiệm ${selectedMember.fullName} làm phó nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Bổ nhiệm",
                                onPress: async () => {
                                  try {
                                    setIsUpdating(true);
                                    // Gọi API để cập nhật vai trò thành viên
                                    await groupService.updateMemberRole(
                                      groupId,
                                      selectedMember.userId,
                                      "CO_LEADER",
                                    );
                                    // Cập nhật lại thông tin nhóm
                                    await fetchGroupDetails();

                                    // Hiển thị thông báo thành công
                                    setToastMessage(
                                      `Đã bổ nhiệm ${selectedMember.fullName} làm phó nhóm`,
                                    );
                                    setShowBlueToast(true);

                                    Alert.alert(
                                      "Thành công",
                                      `Đã bổ nhiệm ${selectedMember.fullName} làm phó nhóm`,
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Error updating member role:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể bổ nhiệm phó nhóm",
                                    );
                                  } finally {
                                    setIsUpdating(false);
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <ShieldAlert
                          size={20}
                          color={Colors.light.PRIMARY}
                        />
                        <Text className="ml-3 text-base">
                          Bổ nhiệm làm phó nhóm
                        </Text>
                      </TouchableOpacity>
                    )}

                  {/* Hạ cấp phó nhóm xuống thành viên thường */}
                  {isGroupLeader && selectedMember.role === "CO_LEADER" && (
                    <TouchableOpacity
                      className="flex-row items-center py-4 border-t border-gray-200"
                      onPress={() => {
                        setShowMemberInfo(false);
                        Alert.alert(
                          "Hạ cấp phó nhóm",
                          `Bạn có muốn hạ cấp ${selectedMember.fullName} xuống thành viên thường?`,
                          [
                            { text: "Hủy", style: "cancel" },
                            {
                              text: "Hạ cấp",
                              onPress: async () => {
                                try {
                                  setIsUpdating(true);
                                  // Gọi API để cập nhật vai trò thành viên
                                  await groupService.updateMemberRole(
                                    groupId,
                                    selectedMember.userId,
                                    "MEMBER",
                                  );
                                  // Cập nhật lại thông tin nhóm
                                  await fetchGroupDetails();

                                  // Hiển thị thông báo thành công
                                  setToastMessage(
                                    `Đã hạ cấp ${selectedMember.fullName} xuống thành viên thường`,
                                  );
                                  setShowBlueToast(true);

                                  Alert.alert(
                                    "Thành công",
                                    `Đã hạ cấp ${selectedMember.fullName} xuống thành viên thường`,
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error updating member role:",
                                    error,
                                  );
                                  Alert.alert(
                                    "Lỗi",
                                    "Không thể hạ cấp phó nhóm",
                                  );
                                } finally {
                                  setIsUpdating(false);
                                }
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <ShieldAlert size={20} color="#6B7280" />
                      <Text className="ml-3 text-base">
                        Hạ cấp xuống thành viên
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Cho phép cả trưởng nhóm và phó nhóm đuổi thành viên, nhưng không thể đuổi trưởng nhóm */}
                  {canManageMembers &&
                    selectedMember.userId !== currentUser?.userId &&
                    selectedMember.role !== "LEADER" && (
                      <TouchableOpacity
                        className="flex-row items-center py-4 border-t border-gray-200"
                        onPress={() => {
                          setShowMemberInfo(false);
                          Alert.alert(
                            "Xóa thành viên",
                            `Bạn có chắc chắn muốn xóa ${selectedMember.fullName || "thành viên này"} khỏi nhóm?`,
                            [
                              { text: "Hủy", style: "cancel" },
                              {
                                text: "Xóa",
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await groupService.removeMember(
                                      groupId,
                                      selectedMember.userId,
                                    );
                                    fetchGroupDetails();

                                    // Hiển thị thông báo thành công
                                    setToastMessage(
                                      `Đã xóa ${selectedMember.fullName} khỏi nhóm`,
                                    );
                                    setShowRedToast(true);
                                  } catch (error) {
                                    console.error(
                                      "Error removing member:",
                                      error,
                                    );
                                    Alert.alert(
                                      "Lỗi",
                                      "Không thể xóa thành viên",
                                    );
                                  }
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Trash2 size={20} color="red" />
                        <Text className="ml-3 text-red-500">Xóa khỏi nhóm</Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal chọn thành viên để chuyển quyền trưởng nhóm */}
      <Modal
        visible={showTransferLeadershipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransferLeadershipModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(148, 163, 184, 0.3)" }}
          onPress={() => setShowTransferLeadershipModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-2">Chọn thành viên</Text>

              <TouchableOpacity
                className="absolute right-0 top-0"
                onPress={() => setShowTransferLeadershipModal(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                group?.members?.filter(
                  (member) =>
                    member.userId !== currentUser?.userId &&
                    member.role !== "LEADER",
                ) || []
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: ExtendedGroupMember }) => (
                <TouchableOpacity
                  className="flex-row items-center py-3 border-b border-gray-100"
                  onPress={() => handleConfirmTransferLeadership(item)}
                >
                  <Avatar size="md">
                    {item.profilePictureUrl ? (
                      <AvatarImage source={{ uri: item.profilePictureUrl }} />
                    ) : (
                      <AvatarFallbackText>
                        {item.fullName || ""}
                      </AvatarFallbackText>
                    )}
                  </Avatar>
                  <Text className="ml-3 font-medium">{item.fullName}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Group Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(148, 163, 184, 0.3)" }}
          onPress={() => setShowActionsModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl px-4 pb-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-xl font-bold text-center mb-4 pt-2">
              Tùy chọn nhóm
            </Text>

            <View className="mt-2 gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowActionsModal(false);
                  setShowQRModal(true);
                }}
                className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
              >
                <View
                  className="p-2 rounded-full mr-3"
                  style={{ backgroundColor: Colors.light.PRIMARY_500 + "15" }}
                >
                  <QrCode size={22} color={Colors.light.PRIMARY} />
                </View>
                <Text className="text-base font-medium">Mã QR nhóm</Text>
              </TouchableOpacity>

              {isGroupLeader && !isLastMember && (
                <TouchableOpacity
                  onPress={() => {
                    setShowActionsModal(false);
                    handleTransferLeadership();
                  }}
                  className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
                >
                  <View
                    className="p-2 rounded-full mr-3"
                    style={{
                      backgroundColor: Colors.light.PRIMARY_500 + "15",
                    }}
                  >
                    <User size={22} color={Colors.light.PRIMARY} />
                  </View>
                  <Text className="text-base font-medium">
                    Chuyển quyền trưởng nhóm
                  </Text>
                </TouchableOpacity>
              )}

              {!isLastMember && (
                <TouchableOpacity
                  onPress={() => {
                    setShowActionsModal(false);
                    handleLeaveGroup();
                  }}
                  className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
                >
                  <View className="bg-red-50 p-2 rounded-full mr-3">
                    <LogOut size={22} color="#EF4444" />
                  </View>
                  <Text className="text-base font-medium text-red-500">
                    Rời khỏi nhóm
                  </Text>
                </TouchableOpacity>
              )}

              {isGroupLeader && (
                <TouchableOpacity
                  onPress={() => {
                    setShowActionsModal(false);
                    handleDeleteGroup();
                  }}
                  className="px-3 py-3 flex-row items-center rounded-lg active:bg-gray-50"
                >
                  <View className="bg-red-50 p-2 rounded-full mr-3">
                    <Trash2 size={22} color="#EF4444" />
                  </View>
                  <Text className="text-base font-medium text-red-500">
                    Giải tán nhóm
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          activeOpacity={1}
          onPress={() => setShowQRModal(false)}
        >
          <View
            className="m-auto bg-white rounded-xl p-6 items-center"
            style={{ width: "80%" }}
          >
            <Text className="text-xl font-bold mb-4">Mã QR nhóm</Text>
            <Text className="text-sm text-gray-500 mb-4 text-center">
              Chia sẻ mã QR này để mời người khác tham gia nhóm
            </Text>
            <View className="p-3 bg-white rounded-lg shadow-sm mb-4">
              <QRCode
                value={`group-${groupId}`}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>
            <TouchableOpacity
              className="py-3 px-6 rounded-full"
              style={{ backgroundColor: Colors.light.PRIMARY_500 }}
              onPress={() => setShowQRModal(false)}
            >
              <Text className="text-white font-bold">Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Members Modal */}
      <Modal
        visible={showAddMembersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => handleCloseAddMembersModal()}
      >
        <View className="flex-1 bg-white">
          <LinearGradient
            start={{ x: 0.03, y: 0 }}
            end={{ x: 0.99, y: 2.5 }}
            colors={Colors.light.GRADIENT as any}
            style={{
              paddingTop: Platform.OS === "ios" ? insets.top : 0,
            }}
          >
            <HStack className="p-2.5 border-b border-gray-200 justify-between items-center">
              <TouchableOpacity onPress={handleCloseAddMembersModal}>
                <ArrowLeft size={24} color={"white"} />
              </TouchableOpacity>
              <Text className="text-lg text-white font-semibold">
                Thêm thành viên
              </Text>
              <View style={{ width: 24 }} />
            </HStack>
          </LinearGradient>

          <View className="p-4">
            <View className="flex-row items-center p-2 bg-gray-100 rounded-lg mb-4">
              <Search size={20} color="#666" className="ml-2" />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Tìm kiếm bạn bè"
                value={searchQuery}
                onChangeText={handleSearchFriends}
              />
            </View>

            {selectedFriends.size > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-2">
                  Đã chọn {selectedFriends.size} người
                </Text>
              </View>
            )}

            {isLoadingFriends ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator
                  size="large"
                  color={Colors.light.PRIMARY}
                />
              </View>
            ) : filteredFriends.length > 0 ? (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.friendshipId}
                renderItem={({ item }) => {
                  const userId = item.friend.id;
                  const isSelected = selectedFriends.has(userId);
                  const fullName =
                    item.friend.userInfo?.fullName || "Không có tên";
                  const profilePictureUrl =
                    item.friend.userInfo?.profilePictureUrl;

                  return (
                    <Pressable
                      className="flex-row items-center p-3 border-b border-gray-100"
                      onPress={() => toggleFriendSelection(userId)}
                    >
                      <View
                        className="mr-3 w-6 h-6 border border-gray-300 rounded-full items-center justify-center"
                        style={
                          isSelected
                            ? {
                                backgroundColor: Colors.light.PRIMARY,
                                borderColor: Colors.light.PRIMARY,
                              }
                            : {}
                        }
                      >
                        {isSelected && (
                          <View className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </View>
                      <Avatar size="md">
                        {profilePictureUrl ? (
                          <AvatarImage source={{ uri: profilePictureUrl }} />
                        ) : (
                          <AvatarFallbackText>{fullName}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Text className="ml-3 font-medium">{fullName}</Text>
                    </Pressable>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-gray-500 text-center">
                  {searchQuery.length > 0
                    ? "Không tìm thấy bạn bè phù hợp"
                    : "Không có bạn bè nào để thêm vào nhóm"}
                </Text>
              </View>
            )}
          </View>

          {selectedFriends.size > 0 && (
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <TouchableOpacity
                className="py-3 rounded-lg items-center"
                style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                onPress={handleAddMembers}
                disabled={addMembersLoading}
              >
                <Text className="text-white font-bold">
                  {addMembersLoading
                    ? "Đang thêm..."
                    : `Thêm ${selectedFriends.size} người`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Modal đổi tên nhóm */}
      <Modal
        visible={showEditNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditNameModal(false)}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: "white",
              borderRadius: 15,
              padding: 20,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <View className="items-center mb-4">
              <Text className="text-xl font-bold mb-4">Đổi tên nhóm</Text>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  padding: 5,
                }}
                onPress={() => setShowEditNameModal(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 mb-2 font-medium">
                Tên nhóm mới
              </Text>
              <TextInput
                className="p-3 border border-gray-300 rounded-lg"
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Nhập tên nhóm mới"
                autoFocus
              />
            </View>

            <HStack className="justify-end space-x-3">
              <TouchableOpacity
                className="py-2 px-4 rounded-lg border border-gray-300"
                onPress={() => {
                  setNewGroupName(group?.name || "");
                  setShowEditNameModal(false);
                }}
              >
                <Text className="text-gray-600 font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2 px-4 rounded-lg"
                style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                onPress={handleUpdateGroupName}
                disabled={
                  isUpdating ||
                  !newGroupName.trim() ||
                  newGroupName === group?.name
                }
              >
                <Text className="text-white font-medium">
                  {isUpdating ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </HStack>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Function to handle opening the add members modal
  function handleOpenAddMembersModal() {
    setSelectedFriends(new Set());
    setSearchQuery("");
    fetchFriends();
    setShowAddMembersModal(true);
  }

  // Function to handle closing the add members modal
  function handleCloseAddMembersModal() {
    setShowAddMembersModal(false);
    setSelectedFriends(new Set());
    setSearchQuery("");
  }

  // Function to fetch friends
  async function fetchFriends() {
    try {
      setIsLoadingFriends(true);
      const response = await getFriendList();

      // Filter out friends who are already in the group
      const existingMemberIds = new Set(
        group?.members.map((member) => member.userId) || [],
      );
      const availableFriends = response.filter(
        (friend) => !existingMemberIds.has(friend.friend.id),
      );

      setFriends(availableFriends);
      setFilteredFriends(availableFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè");
    } finally {
      setIsLoadingFriends(false);
    }
  }

  // Function to handle search friends
  function handleSearchFriends(text: string) {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter((friend) => {
        const fullName = friend.friend.userInfo?.fullName?.toLowerCase() || "";
        return fullName.includes(text.toLowerCase());
      });
      setFilteredFriends(filtered);
    }
  }

  // Function to toggle friend selection
  function toggleFriendSelection(friendId: string) {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
  }

  // Function to add selected members to the group
  async function handleAddMembers() {
    if (selectedFriends.size === 0) return;

    try {
      setAddMembersLoading(true);
      const memberIds = Array.from(selectedFriends);
      await groupService.addMembersToGroup(groupId, memberIds);

      // Show success message
      setToastMessage(`Đã thêm ${selectedFriends.size} thành viên vào nhóm`);
      setShowBlueToast(true);

      // Close modal and refresh group details
      handleCloseAddMembersModal();
      await fetchGroupDetails();
    } catch (error) {
      console.error("Error adding members to group:", error);
      Alert.alert("Lỗi", "Không thể thêm thành viên vào nhóm");
    } finally {
      setAddMembersLoading(false);
    }
  }
}
