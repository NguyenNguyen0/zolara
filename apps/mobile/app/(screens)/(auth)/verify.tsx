import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import OTPTextView from 'react-native-otp-textinput';
import ShareButton from '@/src/components/button/share.button';
import OTPInput from '@/src/components/input/share.otp';
import ShareCountdownButton from '@/src/components/button/share.coutdown';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';

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

	// Determine flow type
	const flowType = isLogin ? 'login' : isSignup ? 'signup' : 'unknown';

	// Memoize computed values để tránh re-computation không cần thiết
	const isNextDisabled = useMemo(() => otp.length !== 6, [otp.length]);

	const emailDisplay = useMemo(() => {
		return email && email.length > 0 ? email : 'Unknown Email';
	}, [email]);

	// Debug: Log params to see what's being passed
	console.log('Verify params:', params);
	console.log('Email from params:', email);
	console.log('FlowType:', flowType);
	console.log('IsLogin:', isLogin, 'IsSignup:', isSignup);

	const handleNext = useCallback(() => {
		// TODO: Implement navigation to next step
		console.log(
			'OTP:',
			otp,
			'Email:',
			email,
			'Password:',
			password,
			'FlowType:',
			flowType,
		);

		// Different navigation based on flow type
		if (flowType === 'login') {
			// For login: go to main app
			router.dismissAll();
			router.replace('/(screens)/(auth)/login.success');
		} else if (flowType === 'signup') {
			// For signup: might need additional steps or go to main app
			router.dismissAll();
			router.replace('/(screens)/(auth)/signup.name');
		} else {
			// Fallback: go to main app
			console.warn('Unknown flow type, defaulting to main app');
			router.dismissAll();
			router.replace('/(screens)/(tabs)');
		}
	}, [otp, email, password, flowType, router]);

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

			{/* Header with back button */}
			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={
							isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE
						}
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
								? APP_COLOR.GRAY_300
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
