import { useTheme } from "@/src/hooks/useTheme";
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
    const { isDark } = useTheme();
	return (
		<>
			<TouchableOpacity
				onPress={onPress}
				className="flex-row items-center px-4 py-4 bg-light-mode dark:bg-dark-mode border-b-[1px] border-b-secondary-light"
				activeOpacity={0.7}
			>
				<View className="w-8 items-center">{icon}</View>
				<Text className="flex-1 ml-4 text-base text-gray-900 dark:text-white">
					{title}
				</Text>
				<Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
			</TouchableOpacity>
		</>
	);
}
