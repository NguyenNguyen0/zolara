import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CircleHelp } from "lucide-react-native";
import { OtpInput } from "react-native-otp-entry";
import { verifyEmailUpdate, verifyPhoneUpdate } from "@/services/user-service";
import { Colors } from "@/constants/Colors";

const VerifyOTPScreen = () => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState("");
  const [otpKey, setOtpKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { updateId, type, newValue } = useLocalSearchParams();

  const handleVerify = async () => {
    try {
      setIsLoading(true);

      if (otp.length !== 6) {
        Alert.alert("Lỗi", "Vui lòng nhập đủ mã OTP");
        return;
      }

      if (type === "email") {
        await verifyEmailUpdate(otp, updateId as string);
        Alert.alert("Thành công", "Email đã được cập nhật thành công", [
          {
            text: "OK",
            onPress: () => router.navigate("../security"),
          },
        ]);
      } else if (type === "phone") {
        await verifyPhoneUpdate(otp, updateId as string);
        Alert.alert("Thành công", "Số điện thoại đã được cập nhật thành công", [
          {
            text: "OK",
            onPress: () => router.navigate("../security"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Mã OTP không hợp lệ",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (type === "email") {
      return "Xác thực đổi email";
    } else if (type === "phone") {
      return "Xác thực đổi số điện thoại";
    }
    return "Xác thực";
  };

  const getMessage = () => {
    if (type === "email") {
      return `Nhập mã gồm 6 số được gửi đến email ${newValue}`;
    } else if (type === "phone") {
      return `Nhập mã gồm 6 số được gửi đến số điện thoại ${newValue}`;
    }
    return "Nhập mã xác thực gồm 6 số";
  };

  return (
    <View
      className="flex-1 justify-between items-center bg-white pt-8 pb-8 px-4"
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 20,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        className="absolute top-8 left-4"
        style={{
          top: Platform.OS === "ios" ? insets.top : 20,
        }}
      >
        <ArrowLeft size={24} color={"black"} />
      </Pressable>

      <View className="w-full justify-center items-center mt-20">
        <Text className="text-2xl font-bold mb-4">{getTitle()}</Text>

        <Text className="text-center font-semibold mb-2 text-gray-700 px-4">
          {getMessage()}
        </Text>

        <Text className="text-lg font-semibold mb-4">{newValue}</Text>

        <View className="mb-4">
          <OtpInput
            key={otpKey}
            numberOfDigits={6}
            onTextChange={setOtp}
            onFilled={(text) => setOtp(text)}
            disabled={isLoading}
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
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-lg">Xóa</Text>
        </Pressable>

        <Pressable
          onPress={handleVerify}
          className="py-4 rounded-full items-center mt-8 w-full active:opacity-80"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-semibold">Xác nhận</Text>
          )}
        </Pressable>
      </View>

      <Pressable className="flex-row items-center">
        <CircleHelp size={14} color={Colors.light.PRIMARY} />
        <Text
          className="text-center pl-2"
          style={{ color: Colors.light.PRIMARY_500 }}
        >
          Tôi cần trợ giúp với mã xác thực
        </Text>
      </Pressable>
    </View>
  );
};

export default VerifyOTPScreen;
