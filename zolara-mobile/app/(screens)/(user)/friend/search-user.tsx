import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, X, QrCode, Users } from "lucide-react-native";
import { HStack } from "@/components/ui/hstack";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { Colors } from "@/constants/Colors";

import { searchUser } from "@/services/user-service";
import { useAuthStore } from "@/store/authStore";

export default function SearchUserScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const myQrValue = user?.userId ? `friend-${user.userId}` : "friend-myuserid";

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone: string) => {
    return /^[0-9]{10,11}$/.test(phone.replace(/[\s-]/g, ""));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    const query = searchQuery.trim();
    const isEmail = isValidEmail(query);
    const isPhone = isValidPhoneNumber(query);

    if (!isEmail && !isPhone) {
      Alert.alert("Thông báo", "Vui lòng nhập email hoặc số điện thoại hợp lệ");
      return;
    }

    try {
      setIsSearching(true);

      const searchData = isEmail ? { email: query } : { phoneNumber: query };
      const introduce = isEmail
        ? "Tôi biết bạn qua địa chỉ thư điện tử. Chúng mình cùng kết nối nhé!"
        : "Tôi biết bạn qua số điện thoại. Chúng mình cùng kết nối nhé!";

      try {
        // Thử gọi API tìm kiếm
        const userData = await searchUser(searchData);

        // Kiểm tra xem kết quả tìm kiếm có phải là người dùng đang đăng nhập không
        if (user?.userId === userData.id) {
          // Nếu là chính người dùng đang đăng nhập, điều hướng đến trang thông tin cá nhân
          router.push("/(screens)/(user)/info" as any);
        } else {
          // Nếu là người dùng khác, điều hướng đến trang thông tin người dùng khác
          router.push({
            pathname: "/(screens)/(user)/info/[id]" as any,
            params: { id: userData.id, introduce },
          });
        }
      } catch (apiError: any) {
        // Kiểm tra nếu là lỗi 404 (không tìm thấy người dùng) thì không cần báo lỗi
        if (apiError?.response?.status !== 404) {
          // Nếu là lỗi khác ngoài 404 thì ghi log (không hiển thị cho người dùng)
          console.error("API search error:", apiError);
        }

        // Nếu API gặp lỗi, sử dụng dữ liệu mẫu cho mục đích demo
        if (
          (isEmail && query === "thanhcanh.dev@gmail.com") ||
          (isPhone && query === "0325690224")
        ) {
          // Dữ liệu mẫu
          const mockUserData = {
            id: "cea3f6a0-b3bf-4abe-9266-7a3a6fc29173",
            email: "thanhcanh.dev@gmail.com",
            phoneNumber: "0325690224",
            userInfo: {
              fullName: "Nguyễn Thanh Cảnh",
              profilePictureUrl:
                "https://vcnmqyobtaqxbnckzcnr.supabase.co/storage/v1/object/public/avatars/cea3f6a0-b3bf-4abe-9266-7a3a6fc29173/6cf1fd51-5329-4721-80b4-39300fe9e1fb.jpg",
              coverImgUrl:
                "https://vcnmqyobtaqxbnckzcnr.supabase.co/storage/v1/object/public/backgrounds/cea3f6a0-b3bf-4abe-9266-7a3a6fc29173/edd84f86-86ee-4178-a607-54eddbf450ff.jpg",
              bio: "how to replace main by old commit",
            },
            relationship: {
              status: "FRIEND",
              message: "Đã là bạn bè",
              friendshipId: "cb8be32c-c6a7-4aa3-9464-8fac20564c87",
            },
          };

          // Kiểm tra xem kết quả tìm kiếm có phải là người dùng đang đăng nhập không
          if (user?.userId === mockUserData.id) {
            // Nếu là chính người dùng đang đăng nhập, điều hướng đến trang thông tin cá nhân
            router.push("/(screens)/(user)/info" as any);
          } else {
            // Nếu là người dùng khác, điều hướng đến trang thông tin người dùng khác
            router.push({
              pathname: "/(screens)/(user)/info/[id]" as any,
              params: { id: mockUserData.id, introduce },
            });
          }
        }
      }
    } catch (error) {
      // Không cần hiển thị thông báo lỗi, vì đã có thông báo mặc định trong ScrollView
    } finally {
      setIsSearching(false);
    }
  };

  // Không cần hàm handleViewProfile nữa vì đã xử lý trực tiếp trong handleSearch

  const handleStartScan = () => {
    // Điều hướng đến trang quét QR mới
    router.push("./qr");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
      >
        <View
          style={{
            paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 10,
          }}
          className="pb-4 px-4"
        >
          <HStack className="items-center">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </Pressable>
            <Text className="text-white text-xl font-medium ml-4">
              Tìm kiếm người dùng
            </Text>
          </HStack>
        </View>
      </LinearGradient>

      {/* QR Code */}
      <View className="items-center py-6 bg-white">
        <Text className="text-lg font-medium mb-2">Mã QR của tôi</Text>
        <View className="p-3 bg-white rounded-lg shadow-sm">
          <QRCode
            value={myQrValue}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <HStack className="bg-gray-100 rounded-full items-center px-4 py-2.5">
          <TextInput
            className="flex-1 text-base"
            placeholder="Nhập email hoặc số điện thoại..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              className="mr-2"
            >
              <X size={20} color="gray" />
            </Pressable>
          )}
          <Pressable
            onPress={handleSearch}
            className="rounded-full p-2"
            style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          >
            <ArrowRight size={20} color="white" />
          </Pressable>
        </HStack>
      </View>

      {/* Search Results */}
      <ScrollView className="flex-1 px-4">
        {isSearching ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY_500} />
            <Text className="text-gray-500 mt-2">Đang tìm kiếm...</Text>
          </View>
        ) : searchQuery.length > 0 ? (
          <Text className="text-center py-8 text-gray-500">
            Người dùng chưa có tài khoản Zolara hoặc chặn chức năng tìm kiếm từ
            người lạ.
          </Text>
        ) : (
          <Text className="text-center py-8 text-gray-500">
            Nhập email hoặc số điện thoại để tìm kiếm
          </Text>
        )}

        {/* QR Code Scanner Section */}
        {/* <View className="mt-8 border-t border-gray-200 pt-6">
          <Pressable
            onPress={handleStartScan}
            className="flex-row items-center justify-center bg-gray-100 py-4 px-6 rounded-lg active:bg-gray-200"
          >
            <QrCode size={24} color={Colors.light.PRIMARY_500} />
            <Text className="ml-3 text-lg font-medium text-gray-800">
              Quét mã QR để kết bạn
            </Text>
          </Pressable>
          <Text className="text-center text-gray-500 mt-2 px-4">
            Quét mã QR của bạn bè để kết nối nhanh chóng
          </Text>
        </View> */}
      </ScrollView>
    </View>
  );
}
