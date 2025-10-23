import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingItem from '@/src/components/item/setting.item';
import { APP_COLOR } from '@/src/utils/constants';
import ContactItem from '@/src/components/item/contact.item';
import { router } from 'expo-router';
import DividerSpacing from '@/src/components/ui/divider.spacing';

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
];

export default function UserTab() {
	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader title={'You'} showSettings />

			<ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
				<View className="ml-4">
					<ContactItem
						img={
							'https://avatars.githubusercontent.com/u/121565657?v=4'
						}
						name={'Tokuda Nguyễn'}
						email={'tokuda@gmail.com'}
						verified={true}
						onPress={() =>
							router.navigate('/(screens)/(user)/[id]')
						}
					/>
				</View>

				<DividerSpacing />

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

				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
