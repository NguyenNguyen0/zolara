import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoHome = () => {
    router.replace("/(screens)/(auth)/welcome");
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(screens)/(tabs)");
    }
  };

  // Calculate available height
  const availableHeight = height - insets.top - insets.bottom;
  const imageSize = Math.min(width * 0.5, availableHeight * 0.35);

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ paddingVertical: 20 }}
      >
        {/* 404 Image */}
        <View className="items-center justify-center mb-4">
          <Image
            source={require("@/assets/images/default/404.gif")}
            style={{
              width: imageSize,
              height: imageSize,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Error Code */}
        <Text
          className="text-6xl font-black mb-2"
          style={{ color: Colors.light.PRIMARY_500 }}
        >
          404
        </Text>

        {/* Title */}
        <Text
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: Colors.light.text }}
        >
          Trang không tìm thấy
        </Text>

        {/* Description */}
        <Text
          className="text-sm text-center leading-5 mb-6 max-w-xs"
          style={{ color: Colors.light.icon }}
        >
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Text>

        {/* Buttons */}
        <View className="w-full max-w-xs gap-3">
          {/* Go Home Button */}
          <TouchableOpacity
            onPress={handleGoHome}
            className="py-3 px-6 rounded-full items-center justify-center"
            style={{
              backgroundColor: Colors.light.PRIMARY_500,
              shadowColor: Colors.light.PRIMARY_500,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Home size={18} color="white" />
              <Text className="text-white text-base font-semibold">
                Về trang chủ
              </Text>
            </View>
          </TouchableOpacity>

          {/* Go Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="py-3 px-6 rounded-full items-center justify-center border-2"
            style={{
              borderColor: Colors.light.PRIMARY_500,
              backgroundColor: "transparent",
            }}
          >
            <View className="flex-row items-center gap-2">
              <ArrowLeft size={18} color={Colors.light.PRIMARY_500} />
              <Text
                className="text-base font-semibold"
                style={{ color: Colors.light.PRIMARY_500 }}
              >
                Quay lại
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

