import { ScrollView, View } from "react-native";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import {
  Play,
  Newspaper,
  Gamepad2,
  Calendar,
  Grid3x3,
  Briefcase,
  Building2,
  Layers,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";

export default function DiscoverScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="h-2.5 w-full"></View>

      <FunctionButton
        disabled={false}
        icon={<Sparkles size={23} color={Colors.light.PRIMARY} />}
        title={"AI Assistant"}
        description={"Trợ lý ảo Zolara hỏi đáp mọi thứ trên đời"}
        onPress={() => router.push("/(screens)/(user)/chatbot" as any)}
      />

      <FunctionButton
        disabled={true}
        icon={<Play size={23} color={Colors.light.PRIMARY} />}
        title={"Zolara Video"}
        description={"[Xem nhiều] Vì sao hàng trăm con giun..."}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Newspaper size={23} color={Colors.light.PRIMARY} />}
        title={"Trang tin tổng hợp"}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Gamepad2 size={23} color={Colors.light.PRIMARY} />}
        title={"Game Center"}
        description={"Sự kiện Thiên thần giáng thế"}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Calendar size={23} color={Colors.light.PRIMARY} />}
        title={"Dịch vụ đời sống"}
        description={"Nạp điện thoại, Tra hóa đơn, ..."}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Grid3x3 size={23} color={Colors.light.PRIMARY} />}
        title={"Tiện ích tài chính"}
        description={"Vay nhanh, Thẻ hoàn tiền, VN-Index, ..."}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Briefcase size={23} color={Colors.light.PRIMARY} />}
        title={"Tìm việc"}
        description={"Tuyển dụng và tìm việc làm gần bạn"}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Building2 size={23} color={Colors.light.PRIMARY} />}
        title={"Trợ lý Công Dân Số"}
        description={"AI hỏi đáp thủ tục hành chính công"}
        onPress={() => {}}
      />

      <FunctionButton
        disabled={true}
        icon={<Layers size={23} color={Colors.light.PRIMARY} />}
        title={"Mini App"}
        onPress={() => {}}
      />

      <View className="h-2.5 w-full"></View>
    </ScrollView>
  );
}
