import React from 'react';
import { View, Text, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import ShareButton from '@/src/components/button/share.button';

const LoginSuccess = () => {
	const { t } = useTranslation('login-success');
	const { isDark } = useTheme();

	const handleDone = () => {
		// Navigate to main app or next screen
		router.replace('/(screens)/(tabs)');
	};

	return (
		<>
			<Stack.Screen options={{ title: t('title') }} />
			<View
				className="flex-1 items-center justify-center px-5"
				style={{
					backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
				}}
			>
				{/* Main Content Container */}
				<View className="flex-1 items-center justify-center">
					{/* Profile Picture with Success Check */}
					<View className="relative mb-5">
						<Image
							source={require('@/src/assets/brand/logo.png')}
							className="w-36 h-36 rounded-full"
							resizeMode="cover"
						/>
						{/* Success Check Mark */}
						<View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 items-center justify-center border-3 border-white">
							<Text className="text-white text-base font-bold">
								✓
							</Text>
						</View>
					</View>

					{/* User Name */}
					<Text
						className="text-3xl font-bold mb-2 text-center"
						style={{
							color: isDark
								? APP_COLOR.LIGHT_MODE
								: APP_COLOR.GRAY_700,
						}}
					>
						{t('userName')}
					</Text>

					{/* Success Message */}
					<Text
						className="text-xl mb-10 text-center"
						style={{
							color: isDark
								? APP_COLOR.GRAY_200
								: APP_COLOR.GRAY_700,
						}}
					>
						{t('successMessage')}
					</Text>
				</View>

				{/* Done Button - Fixed at bottom */}
				<View className="w-full max-w-xs mb-16">
					<ShareButton
						title={t('buttons.done')}
						onPress={handleDone}
						buttonStyle={{
							backgroundColor: APP_COLOR.PRIMARY,
							borderRadius: 12,
							paddingVertical: 16,
							paddingHorizontal: 24,
							width: '100%',
							alignItems: 'center',
							justifyContent: 'center',
							shadowColor: APP_COLOR.PRIMARY,
							shadowOffset: {
								width: 0,
								height: 4,
							},
							shadowOpacity: 0.3,
							shadowRadius: 8,
							elevation: 8,
						}}
						textStyle={{
							color: APP_COLOR.LIGHT_MODE,
							fontSize: 18,
							fontWeight: 'bold',
						}}
					/>
				</View>
			</View>
		</>
	);
};

export default LoginSuccess;
