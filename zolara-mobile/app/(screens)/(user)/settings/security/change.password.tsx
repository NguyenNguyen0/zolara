import React, { useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/services/user-service";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp");
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      await changePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert("Thành công", "Đổi mật khẩu thành công", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.",
      );
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
          <Text className="text-lg text-white font-medium ml-4">
            Đổi mật khẩu
          </Text>
        </View>
      </LinearGradient>

      <View className="p-4 flex-1">
        <View className="flex-row items-center mb-8 mt-4">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1"
          >
            <InputField
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại..."
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              className="ml-2"
            >
              {showCurrentPassword ? (
                <Eye size={24} color="gray" />
              ) : (
                <EyeOff size={24} color="gray" />
              )}
            </TouchableOpacity>
          </Input>
        </View>

        <View className="flex-row items-center mb-8">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1"
          >
            <InputField
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              className="ml-2"
            >
              {showNewPassword ? (
                <Eye size={24} color="gray" />
              ) : (
                <EyeOff size={24} color="gray" />
              )}
            </TouchableOpacity>
          </Input>
        </View>

        <View className="flex-row items-center mb-10">
          <Input
            variant="underlined"
            size="xl"
            isDisabled={false}
            isInvalid={false}
            isReadOnly={false}
            className="flex-1"
          >
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới..."
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2"
            >
              {showConfirmPassword ? (
                <Eye size={24} color="gray" />
              ) : (
                <EyeOff size={24} color="gray" />
              )}
            </TouchableOpacity>
          </Input>
        </View>

        <TouchableOpacity
          className="py-4 rounded-full items-center mx-14"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={handleChangePassword}
        >
          <Text className="text-white text-lg font-semibold">Đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
