import { APP_COLOR } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface SettingItemProps {
	icon: React.ReactNode;
	title: string;
	onPress?: () => void;
}

export default function SettingItem({
	icon,
	title,
	onPress,
}: SettingItemProps) {
	return (
		<>
			<TouchableOpacity
				onPress={onPress}
				className="flex-row items-center px-4 py-4 bg-white border-b-[1px] border-gray-200"
				activeOpacity={0.7}
			>
				<View className="w-8 items-center">{icon}</View>
				<Text className="flex-1 ml-4 text-base text-gray-900">
					{title}
				</Text>
				<Ionicons name="chevron-forward" size={20} color={APP_COLOR.DARK_MODE} />
			</TouchableOpacity>
		</>
	);
}
