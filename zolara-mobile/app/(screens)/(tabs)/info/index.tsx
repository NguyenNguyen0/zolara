import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import {
  Cloudy,
  Database,
  FolderOpen,
  LockKeyhole,
  Palette,
  QrCode,
  ShieldCheck,
} from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
export default function InfoScreen() {
  const user = useAuthStore((state) => state.user);
  const userInfo = useAuthStore((state) => state.userInfo);
  
  // fullName nằm trong userInfo, không phải user
  const displayName = userInfo?.fullName || user?.fullName || "Người dùng";

  return (
    <ScrollView className="flex-1  bg-gray-100">
      {user && (
        <FunctionButton
          avatar={
            <Avatar size="md">
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
              {userInfo?.profilePictureUrl && (
                <AvatarImage source={{ uri: userInfo.profilePictureUrl }} />
              )}
            </Avatar>
          }
          title={displayName}
          description={"Xem trang cá nhân"}
          onPress={function (): void {
            router.push("/(screens)/(user)/info" as any);
          }}
          size={"lg"}
        />
      )}
      <View className="h-2.5 w-full"></View>
      <FunctionButton
        icon={<ShieldCheck size={23} color={Colors.light.PRIMARY} />}
        title={"Tài khoản và bảo mật"}
        onPress={() => router.push("/(screens)/(user)/settings/security" as any)}
      />
      <FunctionButton
        disabled={true}
        icon={<LockKeyhole size={23} color={Colors.light.PRIMARY} />}
        title={"Quyền riêng tư"}
        onPress={() => {}}
      />
      <View className="h-2.5 w-full"></View>
      <FunctionButton
        disabled={true}
        icon={<Cloudy size={23} color={Colors.light.PRIMARY} />}
        title={"ZCloud"}
        description={"Không gian lưu trữ dữ liệu đám mây"}
        onPress={() => {}}
      />
      <FunctionButton
        disabled={true}
        icon={<Palette size={23} color={Colors.light.PRIMARY} />}
        title={"zStyle - Nổi bật trên Zolara"}
        description={"Hình nền và nhạc cho cuộc gọi Zolara"}
        onPress={() => {}}
      />
      <View className="h-2.5 w-full"></View>
      <FunctionButton
        disabled={true}
        icon={<FolderOpen size={23} color={Colors.light.PRIMARY} />}
        title={"Cloud của tôi"}
        description={"Lưu trữ các tin nhắn quan trọng"}
        onPress={() => {}}
      />
      <FunctionButton
        disabled={true}
        icon={<Database size={23} color={Colors.light.PRIMARY} />}
        title={"Dữ liệu trên đám mây"}
        description={"Quản lý dữ liệu Zolara của bạn"}
        onPress={() => {}}
      />
      <FunctionButton
        disabled={true}
        icon={<QrCode size={23} color={Colors.light.PRIMARY} />}
        title={"Ví QR"}
        description={"Lưu trữ và xuất trình các mã QR quan trọng"}
        onPress={() => {}}
      />
      <View className="h-2.5 w-full"></View>
    </ScrollView>
  );
}
