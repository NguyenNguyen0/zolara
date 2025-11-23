import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import {
  X,
  Edit2,
  UserPlus,
  LogOut,
  Trash2,
  Camera,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { groupService } from "@/services/group-service";
import { Group, GroupMember } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GroupDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  visible,
  onClose,
  groupId,
  onLeaveGroup,
  onDeleteGroup,
}) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && groupId) {
      fetchGroupDetails();
    }
  }, [visible, groupId]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    try {
      const groupData = await groupService.getGroupDetails(groupId);
      if (groupData) {
        setGroup(groupData);
        setNewGroupName(groupData.name);
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
        setIsEditing(false);
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
      mediaTypes: ["images"], //ImagePicker.MediaTypeOptions.Images,
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
    Alert.alert("Rời nhóm", "Bạn có chắc chắn muốn rời khỏi nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời nhóm",
        style: "destructive",
        onPress: async () => {
          setIsUpdating(true);
          try {
            const success = await groupService.leaveGroup(groupId);
            if (success) {
              onLeaveGroup();
              onClose();
            }
          } catch (error) {
            console.error("Error leaving group:", error);
            Alert.alert("Lỗi", "Không thể rời khỏi nhóm");
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
              const success = await groupService.deleteGroup(groupId);
              if (success) {
                onDeleteGroup();
                onClose();
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

  const isGroupLeader = group?.members.some(
    (member) =>
      member.userId === currentUser?.userId && member.role === "LEADER",
  );

  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <HStack className="py-3 border-b border-gray-100 items-center">
      <Avatar size="md">
        {item.user?.profilePictureUrl ? (
          <AvatarImage source={{ uri: item?.user?.profilePictureUrl }} />
        ) : (
          <AvatarFallbackText>{item?.user?.fullName}</AvatarFallbackText>
        )}
      </Avatar>
      <VStack className="ml-3 flex-1">
        <Text className="font-medium">{item.user?.fullName}</Text>
        <Text
          className={`text-xs ${
            item.role === "LEADER"
              ? "text-red-500"
              : item.role === "CO_LEADER"
                ? "text-blue-500"
                : "text-gray-500"
          }`}
        >
          {item.role === "LEADER"
            ? "Trưởng nhóm"
            : item.role === "CO_LEADER"
              ? "Phó nhóm"
              : "Thành viên"}
        </Text>
      </VStack>

      {isGroupLeader && item.userId !== currentUser?.userId && (
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            Alert.alert(
              "Xóa thành viên",
              `Bạn có chắc chắn muốn xóa ${item.user?.fullName} khỏi nhóm?`,
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Xóa",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await groupService.removeMember(groupId, item.userId);
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
          <Trash2 size={20} color={"red"} />
        </TouchableOpacity>
      )}
    </HStack>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-transparent">
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
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={"white"} />
            </TouchableOpacity>
            <Text className="text-lg text-white font-semibold">
              Thông tin nhóm
            </Text>
            <View style={{ width: 24 }} />
          </HStack>
        </LinearGradient>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
          </View>
        ) : group ? (
          <VStack className="flex-1">
            {/* Group Info */}
            <VStack className="p-4 items-center border-b border-gray-200">
              <TouchableOpacity
                onPress={handleUpdateGroupAvatar}
                disabled={!isGroupLeader || isUpdating}
                className="relative"
              >
                <Avatar size="xl">
                  {group.avatarUrl ? (
                    <AvatarImage source={{ uri: group.avatarUrl }} />
                  ) : (
                    <AvatarFallbackText>{group.name}</AvatarFallbackText>
                  )}
                </Avatar>
                {isGroupLeader && (
                  <View
                    className="absolute bottom-0 right-0 rounded-full p-1"
                    style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                  >
                    <Camera size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {isEditing ? (
                <HStack className="mt-3 items-center">
                  <TextInput
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={handleUpdateGroupName}
                    disabled={isUpdating}
                    className="ml-2"
                  >
                    <Text
                      className="font-medium"
                      style={{ color: Colors.light.PRIMARY_500 }}
                    >
                      Lưu
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setNewGroupName(group.name);
                    }}
                    className="ml-2"
                  >
                    <Text className="text-gray-500">Hủy</Text>
                  </TouchableOpacity>
                </HStack>
              ) : (
                <HStack className="mt-3 items-center">
                  <Text className="text-xl font-semibold">{group.name}</Text>
                  {isGroupLeader && (
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      className="ml-2"
                    >
                      <Edit2 size={16} color={Colors.light.PRIMARY} />
                    </TouchableOpacity>
                  )}
                </HStack>
              )}

              <Text className="text-gray-500 mt-1">
                {group.members.length} thành viên
              </Text>
            </VStack>

            {/* Members List */}
            <View className="flex-1">
              <HStack className="px-4 py-3 bg-gray-50 justify-between items-center">
                <Text className="font-semibold">Thành viên nhóm</Text>
                {isGroupLeader && (
                  <TouchableOpacity className="flex-row items-center">
                    <UserPlus size={18} color={Colors.light.PRIMARY} />
                    <Text
                      className="ml-1"
                      style={{ color: Colors.light.PRIMARY_500 }}
                    >
                      Thêm
                    </Text>
                  </TouchableOpacity>
                )}
              </HStack>

              <FlatList
                data={group.members}
                keyExtractor={(item) => item.id}
                renderItem={renderMemberItem}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>

            {/* Actions */}
            <VStack className="p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleLeaveGroup}
                className="flex-row items-center py-3"
              >
                <LogOut size={20} color={"red"} />
                <Text className="ml-3 text-red-500">Rời khỏi nhóm</Text>
              </TouchableOpacity>

              {isGroupLeader && (
                <TouchableOpacity
                  onPress={handleDeleteGroup}
                  className="flex-row items-center py-3"
                >
                  <Trash2 size={20} color={"red"} />
                  <Text className="ml-3 text-red-500">Xóa nhóm</Text>
                </TouchableOpacity>
              )}
            </VStack>
          </VStack>
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
      </View>
    </Modal>
  );
};

export default GroupDetailsModal;
