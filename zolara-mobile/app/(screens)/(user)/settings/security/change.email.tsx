import React, { useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initiateEmailUpdate } from "@/services/user-service";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";

export default function ChangeEmailScreen() {
  const insets = useSafeAreaInsets();
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, user } = useAuthStore();

  const handleInitiateEmailUpdate = async () => {
    if (!newEmail) {
      Alert.alert("Lỗi", "Vui lòng nhập email mới");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    // Kiểm tra nếu email mới trùng với email hiện tại
    if (user?.email === newEmail) {
      Alert.alert("Lỗi", "Email mới không được trùng với email hiện tại");
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiateEmailUpdate(newEmail);

      // Chuyển đến màn hình xác thực OTP
      router.push({
        pathname: "/(screens)/(user)/settings/security/verify.otp" as any,
        params: {
          updateId: response.updateId,
          type: "email",
          newValue: newEmail,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể khởi tạo quá trình đổi email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
        style={{
          paddingTop: insets.top,
          paddingBottom: 10,
        }}
      >
        <View className="flex-row items-center px-4 pt-2 pb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-medium ml-4">Đổi email</Text>
        </View>
      </LinearGradient>

      <View className="p-4 flex-1">
        {user?.email && (
          <View className="mb-6">
            <Text className="text-gray-500 mb-2">Email hiện tại</Text>
            <Text className="text-gray-700 font-medium">{user.email}</Text>
          </View>
        )}

        <View className="flex-row items-center mb-8 mt-4">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={isLoading}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1"
          >
            <InputField
              placeholder="Nhập email mới..."
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
        </View>

        <TouchableOpacity
          className="py-4 rounded-full items-center mx-14"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={handleInitiateEmailUpdate}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-semibold">
            {isLoading ? "Đang xử lý..." : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
