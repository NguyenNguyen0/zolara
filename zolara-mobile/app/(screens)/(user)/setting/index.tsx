import ShareButton from '@/src/components/button/share.button';
import NavigateHeader from '@/src/components/commons/navigate.header';
import SettingItem from '@/src/components/item/setting.item';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { APP_COLOR } from '@/src/utils/constants';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingItemData = {
	id: string;
	iconName: keyof typeof Ionicons.glyphMap;
	title: string;
	onPress: () => void;
};

export default function Setting() {
	const { isDark } = useTheme();
	const { t } = useTranslation('setting');
	const { logout } = useAuthStore();

	const handleLogout = async () => {
		Alert.alert(
			t('logout'),
			t('logoutConfirmation'),
			[
				{
					text: t('cancel'),
					style: 'cancel',
				},
				{
					text: t('confirm'),
					onPress: async () => {
						await logout();
					},
					style: 'destructive',
				},
			],
			{ cancelable: true }
		);
	};

	const SETTING_ITEMS: SettingItemData[] = [
		{
			id: 'account',
			iconName: 'shield-checkmark-outline',
			title: t('accountSecurity'),
			onPress: () => {
				// router.navigate('/(user)/setting/account.security');
				// TODO:
				Alert.alert('In development mode!');
			},
		},
		{
			id: 'language',
			iconName: 'globe-outline',
			title: t('interfaceLanguage'),
			onPress: () => router.navigate('/(user)/setting/interface'),
		},
		{
			id: 'about',
			iconName: 'information-circle-outline',
			title: t('aboutZolara'),
			onPress: () => {
				// router.navigate('/(user)/setting/about');
				// TODO:
				Alert.alert('In development mode!');
			},
		},
		{
			id: 'chatbot',
			iconName: 'chatbubble-ellipses-outline',
			title: t('chatbotAI'),
			onPress: () => router.navigate('/(user)/chatbot'),
		},
		{
			id: 'support',
			iconName: 'help-circle-outline',
			title: t('contactSupport'),
			onPress: () => {
				// router.navigate('/(user)/setting/support');
				// TODO:
				Alert.alert("In development mode!")
			},
		},
	];

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader showBackButton title={t('title')} />

			<ScrollView className="flex-1 bg-light-mode dark:bg-dark-mode">
				{SETTING_ITEMS.map((item) => (
					<SettingItem
						key={item.id}
						icon={
							<Ionicons
								name={item.iconName}
								size={24}
								color={
									isDark
										? APP_COLOR.LIGHT_MODE
										: APP_COLOR.DARK_MODE
								}
							/>
						}
						title={item.title}
						onPress={item.onPress}
					/>
				))}

				{/* Đăng xuất */}
				<View className="px-4 py-4">
					<ShareButton
						title={t('logout')}
						onPress={handleLogout}
						icon={
							<MaterialIcons
								name="logout"
								size={24}
								color={
									isDark
										? APP_COLOR.LIGHT_MODE
										: APP_COLOR.DARK_MODE
								}
							/>
						}
					/>
				</View>

				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
