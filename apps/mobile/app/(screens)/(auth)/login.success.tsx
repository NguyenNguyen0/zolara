import React from 'react';
import { View, Text, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { APP_COLOR } from '@/src/utils/constants';
import ShareButton from '@/src/components/button/share.button';
import { SafeAreaView } from 'react-native-safe-area-context';

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
			isSignup,
		});
		router.replace('/(screens)/(tabs)/conversation');
	};

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<View className="flex-1 px-5 mt-32">
				{/* Title */}
				<Text className="text-3xl font-bold text-center mb-8 text-dark-mode dark:text-light-mode">
					{t('title')}
				</Text>

				{/* Main Content */}
				<View className="flex-1 items-center justify-center">
					<View className="relative mb-5">
						<Image
							source={require('@/src/assets/brand/logo.png')}
							className="w-40 h-40"
							resizeMode='contain'
						/>
					</View>

					<Text className="text-2xl font-semibold mb-2 text-center text-secondary-dark dark:text-secondary-light">
						{t('userName')}
					</Text>
					<Text className="text-base text-center text-secondary-dark dark:text-secondary-light">
						{t('successMessage')}
					</Text>
				</View>

				{/* Bottom Action */}
				<View className="mb-16">
					<ShareButton
						title={t('buttons.done')}
						onPress={handleDone}
						buttonStyle={{ backgroundColor: APP_COLOR.PRIMARY }}
						textStyle={{ color: APP_COLOR.LIGHT_MODE }}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default LoginSuccess;
