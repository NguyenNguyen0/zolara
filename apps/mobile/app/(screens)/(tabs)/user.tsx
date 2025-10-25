import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingItem from '@/src/components/item/setting.item';
import { APP_COLOR } from '@/src/utils/constants';
import ContactItem from '@/src/components/item/contact.item';
import { router } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useTranslation } from 'react-i18next';

type SettingItemData = {
	id: string;
	iconName: keyof typeof Ionicons.glyphMap;
	title: string;
	onPress: () => void;
};

export default function UserTab() {
	const { isDark } = useTheme();
	const { t } = useTranslation('user');

	const SETTING_ITEMS: SettingItemData[] = [
		{
			id: 'account',
			iconName: 'shield-checkmark-outline',
			title: t('accountSecurity'),
			onPress: () => {
				// router.navigate('/(user)/setting/account.security');
				// TODO:
				Alert.alert("In development mode!")
			},
		},
		{
			id: 'chatbot',
			iconName: 'chatbubble-ellipses-outline',
			title: t('chatbotAI'),
			onPress: () => router.navigate('/(user)/chatbot'),
		},
	];

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader title={t('header')} showSettings />

			<ScrollView className="flex-1 bg-light-mode dark:bg-dark-mode">
				<View className="ml-4">
					<ContactItem
						img={
							'https://avatars.githubusercontent.com/u/121565657?v=4'
						}
						name={'Tokuda'}
						email={'tokuda@gmail.com'}
						verified={true}
						onPress={() =>
							router.navigate('/(screens)/(user)/[id]')
						}
					/>
				</View>

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
			</ScrollView>
		</SafeAreaView>
	);
}
