import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DividerSpacing from '@/src/components/ui/divider.spacing';
import { useTheme } from '@/src/hooks/useTheme';
import ShareButton from '@/src/components/button/share.button';

interface SettingItemProps {
	icon: React.ReactNode;
	title: string;
	onPress?: () => void;
	showArrow?: boolean;
	showDivider?: boolean;
}

const SettingItem = ({
	icon,
	title,
	onPress,
	showArrow = true,
	showDivider = true,
}: SettingItemProps) => {
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
				{showArrow && (
					<Ionicons
						name="chevron-forward"
						size={20}
						color="#9CA3AF"
					/>
				)}
			</TouchableOpacity>
			{showDivider && (
				<View className="h-[0.5px] bg-gray-200 dark:bg-gray-700 ml-16" />
			)}
		</>
	);
};

export default function Setting() {
	const router = useRouter();

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader showBackButton title={'Cài đặt'} showSearch />

			<ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
				{/* Quyền riêng tư */}
				<SettingItem
					icon={
						<Ionicons
							name="shield-checkmark-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Tài khoản và bảo mật"
					onPress={() => {}}
					showDivider={false}
				/>

				{/* Thông báo */}
				<SettingItem
					icon={
						<Ionicons
							name="notifications-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Thông báo"
					onPress={() => {}}
					showDivider={false}
				/>

				{/* Tin nhắn */}
				<SettingItem
					icon={
						<Ionicons
							name="chatbubble-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Tin nhắn"
					onPress={() => {}}
					showDivider={false}
				/>

				{/* Cuộc gọi */}
				<SettingItem
					icon={
						<Ionicons
							name="call-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Cuộc gọi"
					onPress={() => {}}
					showDivider={false}
				/>

				{/* Giao diện và ngôn ngữ */}
				<SettingItem
					icon={
						<Ionicons
							name="globe-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Giao diện và ngôn ngữ"
					onPress={() => {}}
					showDivider={false}
				/>

				<DividerSpacing/>

				{/* Thông tin về Zolara */}
				<SettingItem
					icon={
						<Ionicons
							name="information-circle-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Thông tin về Zolara"
					onPress={() => {}}
					showDivider={false}
				/>
				{/* Liên hệ hỗ trợ */}
				<SettingItem
					icon={
						<Ionicons
							name="help-circle-outline"
							size={24}
							color="#0084FF"
						/>
					}
					title="Liên hệ hỗ trợ"
					onPress={() => {}}
					showArrow={false}
					showDivider={false}
				/>

				{/* Đăng xuất */}
				<View className="px-4 py-4">
					<ShareButton
						title='Đăng xuất'
						onPress={() => {}}
						icon={<MaterialIcons name="logout" size={24} color="black" />}
					/>
				</View>

				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
