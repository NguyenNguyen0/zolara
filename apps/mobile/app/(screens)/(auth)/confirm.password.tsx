import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import ShareQuestionLink from '@/src/components/button/share.question';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';

export default function ConfirmPassword() {
	const { t } = useTranslation('confirm-password');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();
	const [password, setPassword] = useState('');

	const email = params.email as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	// Determine flow type
	const flowType = isLogin ? 'login' : isSignup ? 'signup' : 'unknown';

	const handleNext = () => {
		// TODO: Implement navigation to next step
		console.log(
			'Password:',
			password,
			'Email:',
			email,
			'FlowType:',
			flowType,
		);

		// Pass the correct flow type to verify screen
		const verifyParams: any = { email, password };
		if (isLogin) {
			verifyParams.isLogin = '1';
		} else if (isSignup) {
			verifyParams.isSignup = '1';
		}

		router.replace({
			pathname: '/(screens)/(auth)/verify',
			params: verifyParams,
		});
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			{/* Header with back button */}
			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE}
					/>
				</TouchableOpacity>
			</View>

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
						{email ? email : 'Unknown Email'}
					</Text>

					{/* Password Input */}
					<View className="mb-8">
						<ShareInput
							value={password}
							onTextChange={setPassword}
							secureTextEntry={true}
							placeholder={t('passwordPlaceholder')}
							inputStyle={{
								backgroundColor: isDark
									? APP_COLOR.GRAY_200
									: APP_COLOR.TRANSPARENT,
							}}
						/>
					</View>

					{/* Next Button */}
					<ShareButton
						title={t('nextButton')}
						onPress={handleNext}
						disabled={isNextDisabled}
						buttonStyle={{
							backgroundColor: isNextDisabled
								? APP_COLOR.GRAY_300
								: APP_COLOR.PRIMARY,
						}}
						textStyle={{
							color: isNextDisabled ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
						}}
					/>

					{/* Forgot Password Link - Only show for login flow */}
					{isLogin && (
						<View className="flex-row items-center justify-center mt-5">
							<ShareQuestionLink
								questionText=""
								linkName={t('forgotPassword')}
								path="/(auth)/forgot-password"
								linkColor={APP_COLOR.PRIMARY}
							/>
						</View>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
