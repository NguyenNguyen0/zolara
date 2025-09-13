import React from 'react';
import { View, Text, Image } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { APP_COLOR } from '@/src/utils/constants';
import ShareButton from '@/src/components/button/share.button';
import { AntDesign } from '@expo/vector-icons';

const LoginSuccess = () => {
	const { t } = useTranslation('login-success');
	const params = useLocalSearchParams();

	const email = params.email as string;
	const password = params.password as string;
	const otp = params.otp as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const handleDone = () => {
		console.log('Login Success - Submit:', {
			email,
			password,
			otp,
			isLogin,
			isSignup
		});
		// Navigate to main app or next screen
		router.replace('/(screens)/(tabs)');
	};

	return (
		<>
			<Stack.Screen options={{ title: t('title') }} />
			<View className="flex-1 items-center justify-center px-5 bg-light-mode dark:bg-dark-mode">
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
						<View className="absolute bottom-1 right-1 rounded-full">
							<AntDesign name="checkcircle" size={25} style={{color: "#22c55e"}} />
						</View>
					</View>

					{/* User Name */}
					<Text
						className="text-3xl font-bold mb-2 text-center text-secondary-dark dark:text-secondary-light"
					>
						{t('userName')}
					</Text>

					{/* Success Message */}
					<Text
						className="text-xl mb-10 text-center text-secondary-dark dark:text-secondary-light"
					>
						{t('successMessage')}
					</Text>
				</View>

				{/* Done Button - Fixed at bottom */}
				<View className="w-full mb-16">
					<ShareButton
						title={t('buttons.done')}
						onPress={handleDone}
						buttonStyle={{ backgroundColor: APP_COLOR.PRIMARY }}
						textStyle={{ color: APP_COLOR.LIGHT_MODE }}
						// isLoading={true}
					/>
				</View>
			</View>
		</>
	);
};

export default LoginSuccess;
