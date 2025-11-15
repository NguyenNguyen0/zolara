import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ShareButton from '@/src/components/button/share.button';
import ShareTheme from '@/src/components/button/share.theme';
import ShareLanguage from '@/src/components/button/share.language';
import { APP_COLOR } from '@/src/utils/constants';
import { router } from 'expo-router';

export default function Welcome() {
	const { t } = useTranslation('welcome');

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			{/* Theme & Language Selection */}
			<View className="absolute top-12 right-6 z-10 flex-row gap-3">
				<ShareLanguage />
				<ShareTheme />
			</View>

			{/* Content Container */}
			<View className="flex-1 justify-between">
				{/* Logo Section - Takes up most of the space */}
				<View className="flex-1 justify-center items-center px-8">
					<Image
						source={require('@/src/assets/brand/logo.png')}
						resizeMode="contain"
						style={{ width: 200, height: 200 }}
					/>
				</View>

				{/* Bottom Section */}
				<View className="px-6 pb-8 mb-10">
					{/* Buttons Section */}
					<View className="gap-5">
						{/* Login */}
						<ShareButton
							title={t('login')}
							onPress={() =>
								router.navigate('/(screens)/(auth)/login.email')
							}
							buttonStyle={{ backgroundColor: APP_COLOR.PRIMARY }}
							textStyle={{ color: APP_COLOR.LIGHT_MODE }}
							// isLoading={true}
						/>
						{/* Create */}
						<ShareButton
							title={t('createAccount')}
							onPress={() =>
								router.navigate(
									'/(screens)/(auth)/signup.email',
								)
							}
							// isLoading={true}
						/>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
