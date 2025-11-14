import ShareBack from '@/src/components/button/share.back';
import ShareButton from '@/src/components/button/share.button';
import ShareQuestion from '@/src/components/button/share.question';
import ShareInput from '@/src/components/input/share.input';
import { useAuthStore } from '@/src/store/authStore';
import { APP_COLOR } from '@/src/utils/constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmPassword() {
	const { t } = useTranslation('confirm-password');
	const router = useRouter();
	const params = useLocalSearchParams();
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuthStore();

	const email = params.email as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const handleNext = async () => {
		setIsLoading(true);
		try {
			if (isLogin) {
				// Login với email và password
				await login(email, password);
				// Login thành công - chuyển đến màn hình success
				router.dismissAll();
				router.replace({
					pathname: '/(screens)/(auth)/login.success',
					params: { email, password, isLogin: 1, isSignup: 0 },
				});
			} else if (isSignup) {
				// Chưa xử lý!
				// Signup - chuyển đến màn hình nhập name
				router.dismissAll();
				router.replace({
					pathname: '/(screens)/(auth)/signup.name',
					params: { email, password, isLogin: 0, isSignup: 1 },
				});
			}
		} catch (error: any) {
			const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed';
			Alert.alert(
				'Error',
				(isLogin ? 'Đăng nhập thất bại' : 'Đăng ký thất bại') + ': ' + errorMessage,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<ShareBack />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-xl text-center mb-2 text-dark-mode dark:text-light-mode">
						{t('title')}
					</Text>

					{/* Email Display */}
					<Text className="text-3xl font-bold text-center mb-10 text-dark-mode dark:text-light-mode">
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
					<View>
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
								color: isNextDisabled
									? APP_COLOR.DARK_MODE
									: APP_COLOR.LIGHT_MODE,
							}}
							isLoading={isLoading}
						/>
					</View>

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
