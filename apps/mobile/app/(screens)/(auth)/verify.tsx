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
import OTPInput from '@/src/components/input/otp.input';
import CountdownButton from '@/src/components/button/share.coutdown';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/contexts/ThemeContext';

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

	// Memoize computed values để tránh re-computation không cần thiết
	const isNextDisabled = useMemo(() => otp.length !== 6, [otp.length]);

	const emailDisplay = useMemo(() => {
		return email && email.length > 0 ? email : 'Unknown Email';
	}, [email]);

	// Debug: Log params to see what's being passed
	console.log('Verify params:', params);
	console.log('Email from params:', email);
	console.log('Email type:', typeof email);
	console.log('Email length:', email?.length);

	const handleNext = useCallback(() => {
		// TODO: Implement navigation to next step
		console.log(
			'OTP:',
			otp,
			'Email:',
			email,
			'Password:',
			password,
			'IsLogin:',
			isLogin,
		);
		// Reset navigation stack và navigate to tabs
		router.dismissAll();
		router.replace('/(screens)/(tabs)');
	}, [otp, email, password, isLogin]);

	const handleResendCode = useCallback(() => {
		// TODO: Implement resend code logic
		console.log('Resending OTP code...');
	}, []);

	const handleOTPChange = useCallback((text: string) => {
		setOtp(text);
	}, []);

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.WHITE,
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			{/* Header with back button */}
			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={isDark ? APP_COLOR.WHITE : APP_COLOR.DARK}
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
						className="text-3xl font-bold text-center"
						style={{
							color: isDark ? APP_COLOR.WHITE : APP_COLOR.DARK,
						}}
					>
						{t('title')}
					</Text>

					{/* Instructions */}
					<View className="items-center my-10">
						<Text
							className="text-xl text-center leading-6"
							style={{
								color: isDark
									? APP_COLOR.WHITE
									: APP_COLOR.DARK,
							}}
						>
							{t('instruction')}
						</Text>

						{/* Email Display */}
						<Text
							className="text-2xl font-bold text-center my-2"
							style={{
								color: isDark
									? APP_COLOR.WHITE
									: APP_COLOR.DARK,
							}}
						>
							{emailDisplay}
						</Text>

						<Text
							className="text-xl text-center leading-6"
							style={{
								color: isDark
									? APP_COLOR.WHITE
									: APP_COLOR.DARK,
							}}
						>
							{t('instruction2')}
						</Text>
					</View>

					{/* OTP Input */}
					<OTPInput
						isDark={isDark}
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
								? '#cccc'
								: APP_COLOR.PRIMARY,
							borderColor: isNextDisabled
								? '#cccc'
								: APP_COLOR.PRIMARY,
							width: '100%',
							alignSelf: 'stretch',
							justifyContent: 'center',
						}}
						textStyle={{
							color: isNextDisabled ? 'black' : APP_COLOR.WHITE,
							fontSize: 18,
							fontWeight: '600',
						}}
						pressStyle={{
							alignSelf: 'stretch',
						}}
					/>

					{/* Resend Code Link */}
					<CountdownButton
						isDark={isDark}
						onResend={handleResendCode}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
