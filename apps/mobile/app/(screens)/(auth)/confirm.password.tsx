import React, { useState } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import ShareQuestion from '@/src/components/button/share.question';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareBack from '@/src/components/button/share.back';

export default function ConfirmPassword() {
	const { t } = useTranslation('confirm-password');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();
	const [password, setPassword] = useState('');

	const email = params.email as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const handleNext = () => {
		console.log('Password Confirmation:', {
			email,
			password,
			isLogin,
			isSignup
		});
		router.replace({
			pathname: '/(screens)/(auth)/verify',
			params: { email, password, isLogin: isLogin ? 1 : 0, isSignup: isSignup ? 1 : 0 },
		});
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={
					isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE
				}
			/>

			<ShareBack />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text
						className="text-xl text-center mb-2 text-dark-mode dark:text-light-mode"
					>
						{t('title')}
					</Text>

					{/* Email Display */}
					<Text
						className="text-3xl font-bold text-center mb-10 text-dark-mode dark:text-light-mode"
					>
						{email || 'Unknown Email'}
					</Text>

					{/* Password Input */}
					<View className="mb-8">
						<ShareInput
							value={password}
							onTextChange={setPassword}
							secureTextEntry={true}
							placeholder={t('passwordPlaceholder')}
						/>
					</View>

					{/* Next Button */}
					<ShareButton
						title={t('nextButton')}
						onPress={handleNext}
						disabled={isNextDisabled}
						buttonStyle={{
							backgroundColor: isNextDisabled
								? APP_COLOR.GRAY_200
								: APP_COLOR.PRIMARY,
						}}
						textStyle={{
							color: isNextDisabled ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
						}}
					/>

					{/* Forgot Password Link - Only show for login flow */}
					{isLogin && (
						<View className="flex-row items-center justify-center mt-5">
							<ShareQuestion
								questionText=""
								linkName={t('forgotPassword')}
								path="/(auth)/forgot-password"
							/>
						</View>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
