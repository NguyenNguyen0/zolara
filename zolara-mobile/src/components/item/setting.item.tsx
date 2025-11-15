import { useTheme } from "@/src/hooks/useTheme";
import { APP_COLOR } from "@/src/utils/constants";
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
				className="flex-row items-center px-4 py-4 bg-light-mode dark:bg-dark-mode border-b-[1px] border-secondary-light dark:border-secondary-dark"
				activeOpacity={0.7}
			>
				<View className="w-8 items-center">{icon}</View>
				<Text className="flex-1 ml-4 text-base text-dark-mode dark:text-light-mode">
					{title}
				</Text>
				<Ionicons name="chevron-forward" size={20} color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE} />
			</TouchableOpacity>
		</>
	);
}
