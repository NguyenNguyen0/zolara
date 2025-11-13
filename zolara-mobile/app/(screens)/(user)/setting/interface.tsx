import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ShareTheme from '@/src/components/button/share.theme';
import ShareLanguage from '@/src/components/button/share.language';
import NavigateHeader from '@/src/components/commons/navigate.header';

export default function Interface() {
	const { t: tInterface } = useTranslation('interface');
	const { t: tLanguage } = useTranslation('language');
	const { t: tTheme } = useTranslation('theme');

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader showBackButton title={tInterface('title')} />
			
			<ScrollView className="flex-1 px-5 pt-5">
				{/* Language Section */}
				<View className="mb-6 flex-row items-center justify-between">
					<Text className="text-base font-semibold text-dark-mode dark:text-light-mode">
						{tLanguage('selectLanguage')}
					</Text>
					<ShareLanguage />
				</View>

				{/* Theme Section */}
				<View className="mb-6 flex-row items-center justify-between">
					<Text className="text-base font-semibold text-dark-mode dark:text-light-mode">
						{tTheme('selectTheme')}
					</Text>
					<ShareTheme />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
