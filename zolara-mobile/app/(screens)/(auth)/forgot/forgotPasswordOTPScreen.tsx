import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, CircleHelp } from "lucide-react-native";
import { OtpInput } from "react-native-otp-entry";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";

export default function ForgotPasswordOTPScreen() {
  const [otp, setOtp] = useState("");
  const [otpKey, setOtpKey] = useState(0);
  const { verifyForgotPassword } = useAuthStore();

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    try {
      await verifyForgotPassword(otp);
      router.push("../forgot/resetPasswordScreen");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.",
      );
    }
  };

  return (
    <View className="flex-1 justify-between items-center  bg-white pt-8 pb-8 px-4">
      <Pressable
        onPress={() => router.back()}
        className="absolute top-10 left-5"
      >
        <ArrowLeft size={24} color={"black"} />
      </Pressable>
      <View className="w-full justify-center items-center mt-20">
        <Text className="text-2xl font-bold mb-4">Nhập mã xác thực</Text>

        <Text className="text-center font-semibold mb-2 text-gray-700 px-4">
          Nhập mã gồm 6 số được gửi đến email của bạn
        </Text>

        <View className="mb-4">
          <OtpInput
            key={otpKey}
            numberOfDigits={6}
            onTextChange={setOtp}
            onFilled={(text) => setOtp(text)}
            theme={{
              containerStyle: {
                gap: 8,
              },
              pinCodeContainerStyle: {
                width: 48,
                height: 56,
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
              },
              pinCodeTextStyle: {
                fontSize: 18,
                color: "#111827",
              },
              focusedPinCodeContainerStyle: {
                borderColor: Colors.light.PRIMARY_500,
                borderWidth: 2,
              },
            }}
          />
        </View>
        <Pressable
          className="px-4 rounded mb-4 w-full items-center"
          onPress={() => {
            setOtp("");
            setOtpKey((prev) => prev + 1);
          }}
        >
          <Text className="text-gray-700 text-lg">Xóa</Text>
        </Pressable>

        <Pressable
          onPress={handleVerifyOTP}
          className="py-4 rounded-full items-center mt-8 w-full active:opacity-80"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
        >
          <Text className="text-white text-xl font-semibold">Tiếp tục</Text>
        </Pressable>
      </View>
      <Pressable className="flex-row items-center">
        <CircleHelp size={14} color={Colors.light.PRIMARY_500} />
        <Text
          className="text-center pl-2"
          style={{ color: Colors.light.PRIMARY_500 }}
        >
          I still need help with verification codes
        </Text>
      </Pressable>
    </View>
  );
}
