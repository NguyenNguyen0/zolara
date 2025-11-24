import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import ShareInput from "@/components/customize/input/share.input";
import ShareButton from "@/components/customize/button/share.button";
import { APP_COLOR } from "@/utils/constants";
import ShareQuestion from "@/components/customize/button/share.question";
import ShareBack from "@/components/customize/button/share.back";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";

export default function SignUpEmail() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const { initiateRegistration } = useAuthStore();

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    if (!inputValue) {
      Alert.alert(
        "Lỗi",
        isEmail ? "Vui lòng nhập email" : "Vui lòng nhập số điện thoại",
      );
      return;
    }

    if (isEmail && !validateEmail(inputValue)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (!isEmail && !validatePhoneNumber(inputValue)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    try {
      await initiateRegistration(
        isEmail ? inputValue : undefined,
        !isEmail ? inputValue : undefined,
      );
      router.navigate({
        pathname: "/(screens)/(auth)/verify",
        params: {
          [isEmail ? "email" : "phoneNumber"]: inputValue,
          isSignup: 1,
        },
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const isNextDisabled = !inputValue.trim();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ShareBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-5 mt-32"
      >
        {/* Content Container */}
        <View>
          {/* Title */}
          <Text className="text-3xl font-bold text-center mb-4 text-gray-900">
            {isEmail ? "NHẬP EMAIL CỦA BẠN" : "NHẬP SỐ ĐIỆN THOẠI CỦA BẠN"}
          </Text>

          {/* Toggle Email/Phone */}
          {/* <TouchableOpacity
            onPress={() => setIsEmail(!isEmail)}
            className="mb-6 items-center"
          >
            <Text
              className="text-center"
              style={{ color: Colors.light.PRIMARY_500 }}
            >
              {isEmail ? "Đăng ký bằng số điện thoại" : "Đăng ký bằng email"}
            </Text>
          </TouchableOpacity> */}

          {/* Email/Phone Input */}
          <View className="mb-6">
            <ShareInput
              value={inputValue}
              onTextChange={setInputValue}
              keyboardType={isEmail ? "email-address" : "phone-pad"}
              placeholder={isEmail ? "Email ..." : "Số điện thoại ..."}
            />
          </View>

          {/* Next Button */}
          <ShareButton
            title="Tiếp tục"
            onPress={handleNext}
            disabled={isNextDisabled}
            buttonStyle={{
              backgroundColor: isNextDisabled
                ? APP_COLOR.GRAY_200
                : APP_COLOR.PRIMARY,
            }}
            textStyle={{
              color: isNextDisabled
                ? APP_COLOR.DARK_MODE
                : APP_COLOR.LIGHT_MODE,
            }}
          />

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-5">
            <ShareQuestion
              questionText="Bạn đã có tài khoản? "
              linkName="Đăng nhập"
              path=""
              onPress={() => {
                router.replace("/(screens)/(auth)/login.email");
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
