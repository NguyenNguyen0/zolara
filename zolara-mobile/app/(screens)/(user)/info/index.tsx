import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Modal,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Ellipsis,
  Image as ImageIcon,
  User,
  Camera,
  Share2,
  Video,
  Palette,
  Images,
  Sparkles,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  updateCoverImage,
  updateProfilePicture,
} from "@/services/user-service";

export default function UserInfoScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const userInfo = useAuthStore((state) => state.userInfo);
  const posts: any[] = [];
  const [showMenu, setShowMenu] = useState(false);
  
  // fullName nằm trong userInfo, không phải user
  const displayName = userInfo?.fullName || user?.fullName || "Người dùng";

  const handlePickImage = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập thư viện ảnh!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], //ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const formData = new FormData();

        // Xác định MIME type dựa trên phần mở rộng file
        const extension = asset.uri?.split(".")?.pop()?.toLowerCase() ?? "jpg";
        const mimeType = extension === "png" ? "image/png" : "image/jpeg";
        const fileName = `${type === "profile" ? "profile" : "cover"}-image.${extension}`;

        formData.append("file", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as any);

        try {
          if (type === "profile") {
            await updateProfilePicture(formData);
          } else {
            await updateCoverImage(formData);
          }
          Alert.alert("Thành công", "Cập nhật ảnh thành công");
          await useAuthStore.getState().fetchUserInfo();
        } catch (error: any) {
          if (error.response?.data?.message) {
            Alert.alert("Lỗi", error.response.data.message);
          } else {
            Alert.alert("Lỗi", `Không thể cập nhật ảnh: ${error.message}`);
          }
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white">
        <View className="relative">
          {/* Cover Image */}
          {userInfo?.coverImgUrl ? (
            <Image
              source={{ uri: userInfo?.coverImgUrl }}
              className="w-full h-[280px]"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-[280px] bg-gray-300" />
          )}

          {/* Header with transparent background */}
          <View
            className="absolute w-full flex-row justify-between p-4 z-50"
            style={{ paddingTop: insets.top }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
              <Ellipsis size={32} color="white" />
            </TouchableOpacity>
          </View>

          <View className="absolute -bottom-16 w-full items-center">
            <Avatar size="2xl">
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
              {userInfo?.profilePictureUrl && (
                <AvatarImage source={{ uri: userInfo.profilePictureUrl }} />
              )}
            </Avatar>
          </View>
        </View>

        {/* User Info */}
        <View className="mt-20 items-center">
          <Text className="text-2xl font-medium text-gray-800">
            {displayName}
          </Text>

          {/* Bio Field */}
          <View className="mt-2 px-8">
            <Text className="text-center text-gray-600 text-sm">
              {userInfo?.bio}
            </Text>
          </View>
        </View>

        {/* Upcoming Features Notice */}
        <View className="mx-6 mt-6">
          <View
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: Colors.light.PRIMARY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              borderWidth: 1,
              borderColor: Colors.light.PRIMARY_100,
            }}
          >
            {/* Header with icon */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Colors.light.PRIMARY_100 }}
              >
                <Sparkles
                  size={20}
                  color={Colors.light.PRIMARY_600}
                  fill={Colors.light.PRIMARY_600}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: Colors.light.PRIMARY_700 }}
                >
                  Tính năng sắp ra mắt
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Đang được phát triển
                </Text>
              </View>
            </View>

            {/* Features List */}
            <View>
              {/* Feature 1 */}
              <View className="flex-row items-start mb-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: Colors.light.PRIMARY_50 }}
                >
                  <Share2 size={16} color={Colors.light.PRIMARY_600} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Chia sẻ bài viết lên nhật ký
                  </Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View className="flex-row items-start mb-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: Colors.light.PRIMARY_50 }}
                >
                  <Video size={16} color={Colors.light.PRIMARY_600} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Call video
                  </Text>
                </View>
              </View>

              {/* Feature 3 */}
              <View className="flex-row items-start mb-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: Colors.light.PRIMARY_50 }}
                >
                  <Palette size={16} color={Colors.light.PRIMARY_600} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Tùy chỉnh giao diện trang cá nhân
                  </Text>
                </View>
              </View>

              {/* Feature 4 */}
              <View className="flex-row items-start">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: Colors.light.PRIMARY_50 }}
                >
                  <Images size={16} color={Colors.light.PRIMARY_600} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Tạo album ảnh và video
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Posts or Create Post Button */}
        <View className="px-28 mt-4">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <View key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
                <Text>{post}</Text>
              </View>
            ))
          ) : (
            <TouchableOpacity
              className={`w-full flex-row items-center justify-center py-2 rounded-full bg-[${Colors.light.PRIMARY}]`}
              onPress={() => {}}
            >
              <Text className=" text-white font-medium text-lg">
                Đăng lên Nhật Ký
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowMenu(false)}
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

            {/* Menu Options */}
            <View className="w-full">
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  router.push("/(screens)/(user)/info/edit.info" as any);
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <User size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Thông tin cá nhân
                </Text>
              </Pressable>

              <View className="h-px bg-gray-200" />

              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("profile");
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <Camera size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Đổi ảnh đại diện
                </Text>
              </Pressable>

              <View className="h-px bg-gray-200" />

              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("cover");
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <ImageIcon size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Đổi ảnh bìa
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
