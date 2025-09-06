import React from 'react';
import { View, Image, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import ShareButton from '@/src/components/button/share.button';
import ThemeToggle from '@/src/components/ThemeToggle';
import LanguageToggle from '@/src/components/LanguageToggle';
import { useTheme } from '@/src/contexts/ThemeContext';
import { APP_COLOR } from '@/src/utils/constants';
import { router } from 'expo-router';

export default function Welcome() {
	const { t } = useTranslation('welcome');
	const { isDark } = useTheme();

	return (
		<SafeAreaView
			className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
		>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={isDark ? APP_COLOR.DARK : APP_COLOR.WHITE}
			/>
			{/* Theme & Language Selection */}
			<View className="absolute top-12 right-6 z-10 flex-row gap-3">
				<LanguageToggle />
				<ThemeToggle />
			</View>

			{/* Content Container */}
			<View className="flex-1 justify-between">
				{/* Logo Section - Takes up most of the space */}
				<View className="flex-1 justify-center items-center px-8">
					<View className="items-center">
						<Image
							source={require('@/src/assets/brand/logo_temporary.png')}
							resizeMode="contain"
							style={{ width: 200, height: 200 }}
						/>
					</View>
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
							buttonStyle={{
								backgroundColor: APP_COLOR.PRIMARY,
								borderColor: APP_COLOR.PRIMARY,
								width: '100%',
								alignSelf: 'stretch',
								justifyContent: 'center',
							}}
							textStyle={{
								color: APP_COLOR.WHITE,
								fontSize: 18,
								fontWeight: '600',
							}}
							pressStyle={{
								alignSelf: 'stretch',
							}}
						/>
						{/* Create */}
						<ShareButton
							title={t('createAccount')}
							onPress={() => router.navigate('/(screens)/(auth)/signup.email')}
							buttonStyle={{
								backgroundColor: isDark
									? APP_COLOR.GREYDARK
									: APP_COLOR.GREYLIGHT,
								borderColor: isDark
									? APP_COLOR.GREYDARK
									: APP_COLOR.GREYLIGHT,
								width: '100%',
								alignSelf: 'stretch',
								justifyContent: 'center',
							}}
							textStyle={{
								color: isDark
									? APP_COLOR.WHITE
									: APP_COLOR.DARK,
								fontSize: 18,
								fontWeight: '600',
							}}
							pressStyle={{
								alignSelf: 'stretch',
							}}
						/>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
