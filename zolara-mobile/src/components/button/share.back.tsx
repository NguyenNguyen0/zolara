import { useTheme } from "@/src/hooks/useTheme";
import { APP_COLOR } from "@/src/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function ShareBack() {
    const { isDark } = useTheme();
	return (
		<View className="flex-row items-center px-5 py-10">
			<TouchableOpacity onPress={() => router.back()} className="p-2">
				<Ionicons
					name="arrow-back"
					size={24}
					color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE}
				/>
			</TouchableOpacity>
		</View>
	);
}
