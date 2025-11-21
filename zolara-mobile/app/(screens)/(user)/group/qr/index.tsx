import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ArrowLeft, Users, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { groupService } from "@/services/group-service";


export default function QRLoginScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGroupInfo, setIsLoadingGroupInfo] = useState(false);
  const [showGroupJoinConfirmation, setShowGroupJoinConfirmation] =
    useState(false);
  const [groupInfo, setGroupInfo] = useState<{
    id: string;
    name: string;
    memberCount: number;
    avatarUrl?: string;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const insets = useSafeAreaInsets();

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

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setCameraActive(false);

    console.log("Scanned data:", data);

    // Kiểm tra nếu là mã QR nhóm (format: group-{groupId})
    if (data.startsWith("group-")) {
      try {
        const groupId = data.replace("group-", "");
        console.log("Detected group QR code with ID:", groupId);

        // Hiển thị loading indicator
        setIsLoadingGroupInfo(true);

        // Lấy thông tin nhóm
        const groupInfoData = await groupService.getPublicGroupInfo(groupId);
        setGroupInfo(groupInfoData);

        // Ẩn loading và hiển thị xác nhận tham gia nhóm
        setIsLoadingGroupInfo(false);
        setShowGroupJoinConfirmation(true);
      } catch (error) {
        console.error("Error processing group QR code:", error);
        setIsLoadingGroupInfo(false);
        Alert.alert("Lỗi", "Không thể lấy thông tin nhóm. Vui lòng thử lại.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setCameraActive(true);
            },
          },
        ]);
      }
    } else {
      // Mã QR không phải là mã nhóm, hiển thị thông báo
      Alert.alert("Lỗi", "Mã QR không hợp lệ. Vui lòng quét mã QR của nhóm.", [
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


  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-white">
          Đang kiểm tra quyền truy cập camera...
        </Text>
        <Pressable
          className="px-8 py-4 mt-6 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </Pressable>
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
        <Pressable
          className="px-8 py-4 mb-3 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={requestPermission}
        >
          <Text className="text-base font-bold text-white">
            Cấp quyền truy cập
          </Text>
        </Pressable>
        <Pressable
          className="px-8 py-4 mt-3 rounded-full"
          style={{ backgroundColor: Colors.light.PRIMARY_500 }}
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-white">Quay lại</Text>
        </Pressable>
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
        <>
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
          />

          {/* Overlay elements - positioned absolutely on top of CameraView */}
          <View
            className="absolute inset-0"
            style={{
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
            pointerEvents="box-none"
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
        </>
      )}

      {/* Loading overlay khi đang tải thông tin nhóm */}
      {isLoadingGroupInfo && (
        <View className="absolute inset-0 z-30 items-center justify-center bg-black/80">
          <View className="items-center justify-center px-6 py-8 bg-white rounded-2xl">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-base font-medium text-gray-700">
              Đang tải thông tin nhóm...
            </Text>
          </View>
        </View>
      )}

      {/* Back button that's always visible, even during loading */}
      <Pressable
        className="absolute z-20 items-center justify-center w-12 h-12 rounded-full top-12 left-5 bg-black/60"
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
      >
        <ArrowLeft size={26} color="white" />
      </Pressable>

      {/* Group Join Confirmation Modal */}
      <Modal
        visible={showGroupJoinConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowGroupJoinConfirmation(false);
          setScanned(false);
          setCameraActive(true);
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => {
            setShowGroupJoinConfirmation(false);
            setScanned(false);
            setCameraActive(true);
          }}
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

            <View className="items-center w-full mt-2 mb-6">
              <Text className="mb-4 text-xl font-bold text-center">
                Tham gia nhóm
              </Text>

              {groupInfo && (
                <View className="items-center mb-4">
                  <View className="items-center justify-center w-16 h-16 mb-2 bg-blue-100 rounded-full">
                    {groupInfo.avatarUrl ? (
                      <Image
                        source={{ uri: groupInfo.avatarUrl }}
                        style={{ width: 64, height: 64, borderRadius: 32 }}
                      />
                    ) : (
                      <Users size={32} color="#3b82f6" />
                    )}
                  </View>
                  <Text className="text-lg font-bold">{groupInfo.name}</Text>
                  <Text className="text-sm text-gray-500">
                    {groupInfo.memberCount} thành viên
                  </Text>
                </View>
              )}

              <Text className="mb-6 text-base text-center text-gray-600">
                Bạn có muốn tham gia vào nhóm này không?
              </Text>

              <View className="flex-row justify-between w-full gap-4">
                <Pressable
                  onPress={() => {
                    setShowGroupJoinConfirmation(false);
                    setScanned(false);
                    setCameraActive(true);
                  }}
                  className="flex-1 px-4 py-3 border border-red-500 rounded-full"
                >
                  <Text className="text-base font-semibold text-center text-red-500">
                    Huỷ bỏ
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try {
                      if (groupInfo) {
                        await groupService.joinGroup(groupInfo.id);
                        setShowGroupJoinConfirmation(false);

                        // Hiển thị thông báo thành công
                        Alert.alert(
                          "Thành công",
                          `Bạn đã tham gia nhóm ${groupInfo.name}`,
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                // Chuyển hướng đến màn hình chat của nhóm
                                router.push({
                                  pathname: "../chat/[id]",
                                  params: {
                                    id: groupInfo.id,
                                    type: "GROUP",
                                    name: groupInfo.name,
                                    avatarUrl: groupInfo.avatarUrl || undefined,
                                  },
                                });
                              },
                            },
                          ],
                        );
                      }
                    } catch (error) {
                      console.error("Error joining group:", error);
                      Alert.alert(
                        "Lỗi",
                        "Không thể tham gia nhóm. Vui lòng thử lại.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              setShowGroupJoinConfirmation(false);
                              setScanned(false);
                              setCameraActive(true);
                            },
                          },
                        ],
                      );
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-full"
                  style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                >
                  <Text className="text-base font-semibold text-center text-white">
                    Tham gia
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
