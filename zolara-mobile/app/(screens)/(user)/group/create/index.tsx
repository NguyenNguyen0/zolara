import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import CustomToast from "@/components/CustomToast";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, Search, Check, Trash2, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
// Removed RNRestart import as we won't need it anymore
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  getFriendList,
  Friend,
  getContacts,
  ContactUser,
} from "@/services/friend-service";
import { createGroup } from "@/services/group-service";
import { useSocket } from "@/providers/SocketProvider";

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  // We don't need to access the user directly in this component
  // const { user } = useAuthStore();
  const { reconnectMessageSocket } = useSocket(); // Get the reconnectMessageSocket function
  const [showToast, setShowToast] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [filteredItems, setFilteredItems] = useState<(Friend | ContactUser)[]>(
    [],
  );
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [groupAvatar, setGroupAvatar] = useState<any>(null);

  useEffect(() => {
    // Kiểm tra thông tin người dùng khi màn hình được tải
    const checkUserInfo = async () => {
      try {
        const userId = await SecureStore.getItemAsync("userId");
        const userData = await SecureStore.getItemAsync("user");
        const accessToken = await SecureStore.getItemAsync("accessToken");

        console.log("=== USER INFO CHECK ===");
        console.log("User ID:", userId);
        console.log("User Data:", userData);
        console.log("Access Token:", accessToken ? "Exists" : "Not found");
        console.log("========================");
      } catch (error) {
        console.error("Error checking user info:", error);
      }
    };

    checkUserInfo();

    if (activeTab === "recent") {
      fetchFriends();
    } else {
      fetchContacts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(activeTab === "recent" ? friends : contacts);
    } else {
      if (activeTab === "recent") {
        const filtered = friends.filter(
          (friend) =>
            friend.friend.userInfo?.fullName
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) || false,
        );
        setFilteredItems(filtered);
      } else {
        const filtered = contacts.filter(
          (contact) =>
            contact.contactUser.userInfo?.fullName
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) ||
            false ||
            contact.nickname
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) ||
            false,
        );
        setFilteredItems(filtered);
      }
    }
  }, [searchQuery, friends, contacts, activeTab]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriendList();
      setFriends(response);
      setFilteredItems(response);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getContacts();
      setContacts(response);
      setFilteredItems(response);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Không thể tải danh bạ");
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      newSelection.add(friendId);
    }
    setSelectedFriends(newSelection);
  };

  const renderItem = ({ item }: { item: Friend | ContactUser }) => {
    // Kiểm tra xem item là Friend hay ContactUser
    const isFriend = "friend" in item;

    // Lấy ID người dùng
    const userId = isFriend ? item.friend.id : item.contactUser.id;

    // Kiểm tra xem người dùng đã được chọn chưa
    const isSelected = selectedFriends.has(userId);

    // Lấy thông tin người dùng
    const userInfo = isFriend
      ? item.friend.userInfo
      : item.contactUser.userInfo;
    const fullName = userInfo?.fullName || "Không có tên";
    const profilePictureUrl = userInfo?.profilePictureUrl;
    const lastSeen = userInfo?.lastSeen || new Date().toISOString();

    return (
      <Pressable
        style={styles.friendItem}
        onPress={() => toggleFriendSelection(userId)}
        android_ripple={{ color: 'transparent' }}
      >
        <View style={styles.checkboxContainer}>
          <View
            style={[
              styles.checkbox,
              isSelected ? styles.checkboxSelected : null,
            ]}
          >
            {isSelected && <Check size={16} color="white" />}
          </View>
        </View>
        <Avatar size="md" style={styles.avatar}>
          <AvatarFallbackText>{fullName}</AvatarFallbackText>
          {profilePictureUrl && (
            <AvatarImage source={{ uri: profilePictureUrl }} />
          )}
        </Avatar>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{fullName}</Text>
          {!isFriend && item.nickname !== fullName && (
            <Text style={styles.nickname}>{item.nickname}</Text>
          )}
          <Text style={styles.lastSeen}>{formatLastSeen(lastSeen)}</Text>
        </View>
      </Pressable>
    );
  };

  const pickImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Chúng tôi cần quyền truy cập vào thư viện ảnh của bạn để chọn ảnh đại diện nhóm.",
        );
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Kiểm tra kích thước file
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (selectedAsset.fileSize && selectedAsset.fileSize > MAX_FILE_SIZE) {
          Alert.alert("File quá lớn", "Ảnh đại diện phải nhỏ hơn 5MB.");
          return;
        }

        // Tạo đối tượng file để gửi lên server
        const fileType = selectedAsset.uri.endsWith(".png")
          ? "image/png"
          : "image/jpeg";
        const fileName =
          selectedAsset.uri.split("/").pop() || `avatar_${Date.now()}.jpg`;

        const avatarFile = {
          uri: selectedAsset.uri,
          type: fileType,
          name: fileName,
        };

        setGroupAvatar(avatarFile);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại sau.");
    }
  };

  const formatLastSeen = (lastSeenDate: string | undefined) => {
    if (!lastSeenDate) return "Không xác định";
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) {
      const diffMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${diffMinutes} phút trước`;
    }
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    return date.toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {showToast && (
        <CustomToast
          message="Tạo nhóm thành công"
          onHide={() => setShowToast(false)}
        />
      )}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
      >
        <View
          className="flex-row items-center p-4"
          style={{ paddingTop: insets.top }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg text-white font-medium ml-4">Nhóm mới</Text>
        </View>
      </LinearGradient>

      <View style={styles.groupNameContainer}>
        <View style={styles.groupAvatarContainer}>
          <TouchableOpacity style={styles.groupAvatar} onPress={pickImage}>
            {groupAvatar ? (
              <>
                <Image
                  source={{ uri: groupAvatar.uri }}
                  style={styles.avatarImage}
                />
                <TouchableOpacity
                  style={styles.removeAvatarButton}
                  onPress={() => setGroupAvatar(null)}
                >
                  <Trash2 size={16} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <Camera size={24} color="#666" />
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Đặt tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && <Text style={styles.keyboardHint}>123</Text>}
      </View>

      {selectedFriends.size < 2 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Nhóm phải có ít nhất 3 người (bao gồm cả bạn) để có thể tạo nhóm.
          </Text>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "recent" && styles.activeTab]}
          onPress={() => setActiveTab("recent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "recent" && styles.activeTabText,
            ]}
          >
            BẠN BÈ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "contacts" && styles.activeTab]}
          onPress={() => setActiveTab("contacts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "contacts" && styles.activeTabText,
            ]}
          >
            DANH BẠ
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => {
            if ("friend" in item) {
              return item.friendshipId;
            } else {
              return item.id;
            }
          }}
          style={styles.friendsList}
          contentContainerStyle={styles.friendsListContent}
        />
      )}

      {selectedFriends.size > 0 && (
        <TouchableOpacity
          style={[
            styles.createButton,
            selectedFriends.size < 2 && styles.disabledButton,
          ]}
          disabled={selectedFriends.size < 2}
          onPress={async () => {
            if (!groupName.trim()) {
              alert("Vui lòng nhập tên nhóm");
              return;
            }

            if (selectedFriends.size < 2) {
              alert("Nhóm phải có ít nhất 3 người (bao gồm cả bạn)");
              return;
            }

            try {
              setLoading(true);

              const memberIds = Array.from(selectedFriends);

              // Tạo nhóm mới
              await createGroup(groupName.trim(), memberIds, groupAvatar);

              setShowToast(true);

              // Kết nối lại message socket để cập nhật với nhóm mới
              console.log(
                "[CreateGroup] Reconnecting message socket after group creation",
              );
              reconnectMessageSocket();

              // Chuyển hướng về màn hình chính sau khi hiển thị thông báo
              setTimeout(() => {
                router.replace("/(screens)/(tabs)" as any);
              }, 1000);
            } catch (err) {
              console.error("Lỗi khi tạo nhóm:", err);
              alert("Không thể tạo nhóm. Vui lòng thử lại sau.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.createButtonText}>
            {loading
              ? "Đang tạo..."
              : selectedFriends.size < 2
                ? "Chọn thêm người"
                : "Tạo nhóm"}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  // Header styles removed as we're using LinearGradient with className
  selectedCount: {
    fontSize: 14,
    color: "#666",
  },
  warningText: {
    color: "#FF6B6B",
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  groupAvatarContainer: {
    marginRight: 16,
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  removeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.PRIMARY,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  groupNameInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  keyboardHint: {
    fontSize: 14,
    color: "#999",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  activeTabText: {
    color: Colors.light.PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  friendsList: {
    flex: 1,
  },
  friendsListContent: {
    paddingBottom: 80,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.light.PRIMARY,
    borderColor: Colors.light.PRIMARY,
  },
  avatar: {
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  lastSeen: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  nickname: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  createButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.PRIMARY,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
