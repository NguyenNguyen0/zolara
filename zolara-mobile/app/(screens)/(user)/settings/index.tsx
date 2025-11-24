import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from "react-native";
import {
  Bell,
  HelpCircle,
  Info,
  Lock,
  Palette,
  Shield,
  UserCircle,
  ChevronLeft,
  Search,
  LogOut,
  ArrowLeft,
  LogOutIcon,
  ShieldCheck,
  LockIcon,
  LockKeyhole,
  CircleFadingArrowUp,
  RefreshCcw,
  BellIcon,
  MessageCircleMore,
  Phone,
  Clock,
  BookUser,
  PaintBucket,
  InfoIcon,
  CircleHelp,
  UsersRound,
  ArrowRightLeft,
} from "lucide-react-native";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", onPress: logout },
      ],
      { cancelable: false },
    );
  };
  return (
    <View className="flex-1 bg-gray-100 ">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
        style={{
          paddingTop: insets.top,
          paddingBottom: 10,
        }}
      >
        <View className="flex-row items-center justify-between px-2.5 pt-2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={23} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-medium">Cài đặt</Text>
          <TouchableOpacity></TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1">
        <FunctionButton
          icon={<ShieldCheck size={23} color={Colors.light.PRIMARY} />}
          title="Tài khoản và bảo mật"
          onPress={() => router.push("/(screens)/(user)/settings/security" as any)}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<LockKeyhole size={23} color={Colors.light.PRIMARY} />}
          title="Quyền riêng tư"
          onPress={() => {}}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          disabled={true}
          icon={<CircleFadingArrowUp size={23} color={Colors.light.PRIMARY} />}
          title="Dữ liệu trên máy"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<RefreshCcw size={23} color={Colors.light.PRIMARY} />}
          title="Sao lưu và khôi phục"
          onPress={() => {}}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          disabled={true}
          icon={<BellIcon size={23} color={Colors.light.PRIMARY} />}
          title="Thông báo"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<MessageCircleMore size={23} color={Colors.light.PRIMARY} />}
          title="Tin nhắn"
          onPress={() => {
            router.replace("/(screens)/(tabs)" as any);
          }}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<Phone size={23} color={Colors.light.PRIMARY} />}
          title="Cuộc gọi"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<Clock size={23} color={Colors.light.PRIMARY} />}
          title="Nhật ký"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<BookUser size={23} color={Colors.light.PRIMARY} />}
          title="Danh bạ"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<PaintBucket size={23} color={Colors.light.PRIMARY} />}
          title="Giao diện và ngôn ngữ"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          disabled={true}
          icon={<InfoIcon size={23} color={Colors.light.PRIMARY} />}
          title="Thông tin về Zolara"
          onPress={() => {}}
          showBottomBorder={true}
        />
        <FunctionButton
          disabled={true}
          icon={<CircleHelp size={23} color={Colors.light.PRIMARY} />}
          title="Liên hệ hỗ trợ"
          onPress={() => {}}
          isExternalLink={true}
          showBottomBorder={true}
        />
        <View className="h-2.5 w-full"></View>
        <FunctionButton
          disabled={true}
          icon={<ArrowRightLeft size={23} color={Colors.light.PRIMARY} />}
          title="Chuyển tài khoản"
          onPress={() => {}}
        />
        <View className="h-2.5 w-full"></View>

        <TouchableOpacity
          className="flex-row justify-center mb-16 mx-4 bg-gray-200 rounded-full py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-black text-lg font-medium pr-2.5">
            Đăng xuất
          </Text>
          <LogOutIcon size={20} color={"black"} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
