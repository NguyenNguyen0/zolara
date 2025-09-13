import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import OTPTextView from 'react-native-otp-textinput';
import ShareButton from '@/src/components/button/share.button';
import OTPInput from '@/src/components/input/share.otp';
import ShareCountdownButton from '@/src/components/button/share.coutdown';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareBack from '@/src/components/button/share.back';

export default function Verify() {
	const { t } = useTranslation('verify');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();
	const otpInput = useRef<OTPTextView>(null);
	const [otp, setOtp] = useState('');

	const email = params.email as string;
	const password = params.password as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	// Memoize computed values để tránh re-computation không cần thiết
	const isNextDisabled = useMemo(() => otp.length !== 6, [otp.length]);

	const emailDisplay = useMemo(() => {
		return email && email.length > 0 ? email : 'Unknown Email';
	}, [email]);

	const handleNext = useCallback(() => {
		console.log('OTP Verification:', {
			otp,
			email,
			password,
			isLogin,
			isSignup
		});

		// Navigate based on boolean values with full params including OTP
		if (isLogin) {
			router.dismissAll();
			router.replace({
				pathname: '/(screens)/(auth)/login.success',
				params: { email, password, otp, isLogin: 1, isSignup: 0 }
			});
		} else if (isSignup) {
			router.dismissAll();
			router.replace({
				pathname: '/(screens)/(auth)/signup.name',
				params: { email, password, otp, isLogin: 0, isSignup: 1 }
			});
		} else {
			console.warn('No valid flow detected, defaulting to main app');
			router.dismissAll();
			router.replace('/(screens)/(tabs)');
		}
	}, [otp, email, password, isLogin, isSignup, router]);

	const handleResendCode = useCallback(() => {
		// TODO: Implement resend code logic
		console.log('Resending OTP code...');
	}, []);

	const handleOTPChange = useCallback((text: string) => {
		setOtp(text);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			<ShareBack/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-3xl font-bold text-center text-dark-mode dark:text-light-mode">
						{t('title')}
					</Text>

					{/* Instructions */}
					<View className="items-center my-10">
						<Text className="text-xl text-center leading-6 text-dark-mode dark:text-light-mode">
							{t('instruction')}
						</Text>

						{/* Email Display */}
						<Text className="text-2xl font-bold text-center my-2 text-dark-mode dark:text-light-mode">
							{emailDisplay}
						</Text>

						<Text className="text-xl text-center leading-6 text-dark-mode dark:text-light-mode">
							{t('instruction2')}
						</Text>
					</View>

					{/* OTP Input */}
					<OTPInput
						otp={otp}
						onOTPChange={handleOTPChange}
						otpInputRef={otpInput}
					/>

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
							color: isNextDisabled
								? APP_COLOR.DARK_MODE
								: APP_COLOR.LIGHT_MODE,
						}}
					/>

					{/* Resend Code Link */}
					<ShareCountdownButton
						onResend={handleResendCode}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
