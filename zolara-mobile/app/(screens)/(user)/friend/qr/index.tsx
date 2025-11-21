import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ArrowLeft } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Đã xóa các import không cần thiết
import { getUserProfile } from "@/services/user-service";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/Colors";

export default function QRScanFriendScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  // Đã xóa các state không cần thiết
  const [cameraActive, setCameraActive] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Animation for scanning effect
  const scanAnimation = useRef(new Animated.Value(0)).current;

  // Start scanning animation
  const startScanAnimation = () => {
    scanAnimation.setValue(0);
    Animated.loop(
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  // Effect to initialize camera and request permissions if needed
  useEffect(() => {
    // Automatically request camera permission if not granted
    if (permission && !permission.granted) {
      requestPermission();
    }

    // Set a shorter timeout for camera initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [permission]);

  // Reset camera state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("QR scan screen focused, resetting camera");
      setScanned(false);
      setCameraActive(true);
      startScanAnimation();
      return () => {};
    }, []),
  );

  const handleBarCodeScanned = async ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    try {
      setScanned(true);
      setCameraActive(false);

      // Kiểm tra định dạng mã QR
      if (!data.startsWith("friend-")) {
        Alert.alert(
          "Mã QR không hợp lệ",
          "Mã QR này không phải là mã kết bạn. Vui lòng quét mã QR kết bạn hợp lệ.",
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setCameraActive(true);
              },
            },
          ],
        );
        return;
      }

      const userId = data.replace("friend-", "");

      // Kiểm tra nếu người dùng quét mã QR của chính mình
      if (user?.userId === userId) {
        Alert.alert("Thông báo", "Bạn không thể kết bạn với chính mình.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            },
          },
        ]);
        return;
      }

      // Lấy thông tin người dùng từ API để đảm bảo userId hợp lệ
      await getUserProfile(userId);

      // Tạo introduce tự động
      const introduce = "Tôi biết bạn qua mã QR. Chúng mình cùng kết nối nhé!";

      // Chuyển hướng trực tiếp đến trang thông tin người dùng với introduce
      router.push({
        pathname: "/(screens)/(user)/info/[id]" as any,
        params: { id: userId, introduce },
      });
    } catch (error) {
      console.error("Error processing QR code:", error);
      Alert.alert("Lỗi", "Không thể xử lý mã QR. Vui lòng thử lại sau.", [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            setCameraActive(true);
          },
        },
      ]);
    }
  };

  // Xóa các hàm xử lý xác nhận vì chúng ta không còn sử dụng hộp thoại xác nhận nữa

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-white">
          Đang kiểm tra quyền truy cập camera...
        </Text>
        <TouchableOpacity
          className="px-8 py-4 mt-6 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View className="items-center justify-center flex-1 p-4 bg-black">
        <Text className="mb-5 text-lg text-center text-white">
          Ứng dụng cần quyền truy cập camera để quét mã QR
        </Text>
        <TouchableOpacity
          className="px-8 py-4 mb-3 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={requestPermission}
        >
          <Text className="text-base font-bold text-white">
            Cấp quyền truy cập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-8 py-4 mt-3 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="items-center justify-center flex-1 bg-black">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-lg text-white">
            Đang khởi tạo camera...
          </Text>
        </View>
      ) : (
        <CameraView
          className="flex-1"
          facing="back"
          active={cameraActive}
          style={{ flex: 1, minHeight: "100%", width: "100%" }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onCameraReady={() => {
            console.log("Camera ready");
            // Ensure animation starts when camera is ready
            startScanAnimation();
          }}
          onMountError={(error) => {
            console.error("Camera error:", error);
            Alert.alert(
              "Lỗi camera",
              "Không thể khởi tạo camera. Vui lòng thử lại.",
            );
          }}
        >
          <View
            className="flex-1 bg-transparent"
            style={{
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
          >
            {/* Scan frame decoration - only corners with thicker edges */}
            <View
              className="absolute top-1/2 left-1/2 w-[280px] h-[280px]"
              style={{ marginLeft: -140, marginTop: -140 }}
            >
              {/* Top-left corner */}
              <View className="absolute top-0 left-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute top-0 left-0" />
              </View>

              {/* Top-right corner */}
              <View className="absolute top-0 right-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute right-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute top-0 right-0" />
              </View>

              {/* Bottom-left corner */}
              <View className="absolute bottom-0 left-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute bottom-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute bottom-0 left-0" />
              </View>

              {/* Bottom-right corner */}
              <View className="absolute bottom-0 right-0 flex-row">
                <View className="w-[50px] h-[8px] bg-gray-500 rounded-full absolute bottom-0 right-0" />
                <View className="w-[8px] h-[50px] bg-gray-500 rounded-full absolute bottom-0 right-0" />
              </View>

              {/* Scanning animation line */}
              <Animated.View
                style={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  height: 3,
                  backgroundColor: "#9ca3af",
                  transform: [
                    {
                      translateY: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 280],
                      }),
                    },
                  ],
                }}
              />
            </View>

            {/* Scan instruction */}
            <View className="absolute bottom-[100px] left-0 right-0 items-center">
              <View className="flex-row items-center bg-black/70 px-5 py-2.5 rounded-full">
                <Text className="text-base font-bold text-center text-white">
                  Đặt mã QR vào khung để quét
                </Text>
              </View>
            </View>
            {/* Scanning indicator */}
            <View className="absolute top-10 right-5 flex-row items-center bg-black/70 px-4 py-2 rounded-full">
              <Animated.View
                style={{
                  width: 10,
                  height: 10,
                  marginRight: 8,
                  backgroundColor: "#22c55e",
                  borderRadius: 5,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                }}
              />
              <Text className="text-sm font-medium text-white">Đang quét</Text>
            </View>
          </View>
        </CameraView>
      )}

      {/* Back button that's always visible, even during loading */}
      <TouchableOpacity
        className="absolute z-20 items-center justify-center w-12 h-12 rounded-full top-12 left-5 bg-black/60"
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
      >
        <ArrowLeft size={26} color="white" />
      </TouchableOpacity>

      {/* Đã xóa hộp thoại xác nhận */}
    </View>
  );
}
