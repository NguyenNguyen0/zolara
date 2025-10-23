import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DividerSpacing from '@/src/components/ui/divider.spacing';
import { useTheme } from '@/src/hooks/useTheme';
import ShareButton from '@/src/components/button/share.button';
import { APP_COLOR } from '@/src/utils/constants';
import SettingItem from '@/src/components/item/setting.item';

type SettingItemData = {
	id: string;
	iconName: keyof typeof Ionicons.glyphMap;
	title: string;
	onPress: () => void;
};

const SETTING_ITEMS: SettingItemData[] = [
	{
		id: 'account',
		iconName: 'shield-checkmark-outline',
		title: 'Tài khoản và bảo mật',
		onPress: () => {},
	},
	{
		id: 'notification',
		iconName: 'notifications-outline',
		title: 'Thông báo',
		onPress: () => {},
	},
	{
		id: 'message',
		iconName: 'chatbubble-outline',
		title: 'Tin nhắn',
		onPress: () => {},
	},
	{
		id: 'call',
		iconName: 'call-outline',
		title: 'Cuộc gọi',
		onPress: () => {},
	},
	{
		id: 'language',
		iconName: 'globe-outline',
		title: 'Giao diện và ngôn ngữ',
		onPress: () => {},
	},
];

export default function Setting() {
	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader showBackButton title={'Cài đặt'} />

			<ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
				{SETTING_ITEMS.map((item) => (
					<SettingItem
						key={item.id}
						icon={
							<Ionicons
								name={item.iconName}
								size={24}
								color={APP_COLOR.PRIMARY}
							/>
						}
						title={item.title}
						onPress={item.onPress}
					/>
				))}

				<DividerSpacing/>

				{/* Thông tin về Zolara */}
				<SettingItem
					icon={
						<Ionicons
							name="information-circle-outline"
							size={24}
							color={APP_COLOR.PRIMARY}
						/>
					}
					title="Thông tin về Zolara"
					onPress={() => {}}
				/>
				{/* Liên hệ hỗ trợ */}
				<SettingItem
					icon={
						<Ionicons
							name="help-circle-outline"
							size={24}
							color={APP_COLOR.PRIMARY}
						/>
					}
					title="Liên hệ hỗ trợ"
					onPress={() => {}}
				/>

				{/* Đăng xuất */}
				<View className="px-4 py-4">
					<ShareButton
						title='Đăng xuất'
						onPress={() => Alert.alert("Chưa có logout")}
						icon={<MaterialIcons name="logout" size={24} color="black" />}
					/>
				</View>

				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
