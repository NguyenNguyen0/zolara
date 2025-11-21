import React, { useState, useCallback, useMemo } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { OtpInput } from 'react-native-otp-entry';
import ShareButton from '@/components/customize/button/share.button';
import ShareCountdownButton from '@/components/customize/button/share.coutdown';
import { APP_COLOR } from '@/utils/constants';
import ShareBack from '@/components/customize/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';

export default function Verify() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [otp, setOtp] = useState('');
	const [otpKey, setOtpKey] = useState(0);
	const { verifyRegistration } = useAuthStore();

	const email = params.email as string;
	const phoneNumber = params.phoneNumber as string;
	const identifier = email || phoneNumber;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	// Memoize computed values để tránh re-computation không cần thiết
	const isNextDisabled = useMemo(() => otp.length !== 6, [otp]);

	const identifierDisplay = useMemo(() => {
		return identifier && identifier.length > 0 ? identifier : 'Unknown';
	}, [identifier]);

	const handleNext = useCallback(async () => {
		if (otp.length !== 6) {
			Alert.alert('Lỗi', 'Vui lòng nhập đủ mã OTP');
			return;
		}

		if (isSignup) {
			try {
				await verifyRegistration(otp);
				router.navigate({
					pathname: '/(screens)/(auth)/confirm.password',
					params: { 
						email: email || identifier,
						isSignup: 1,
					},
				});
			} catch (error: any) {
				Alert.alert('Lỗi', error.response?.data?.message || 'Mã OTP không hợp lệ');
			}
		} else if (isLogin) {
			router.dismissAll();
			router.replace({
				pathname: '/(screens)/(auth)/login.success',
				params: { identifier, otp, isLogin: 1, isSignup: 0 }
			});
		}
	}, [otp, identifier, email, isLogin, isSignup, router, verifyRegistration]);



	const handleResendCode = useCallback(() => {
		console.log('Resending OTP code...');
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ShareBack/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-3xl font-bold text-center text-gray-900">
						Nhập mã xác thực
					</Text>

					{/* Instructions */}
					<View className="items-center my-10">
						<Text className="text-xl text-center leading-6 text-gray-700">
							Nhập mã gồm 6 số được gửi đến
						</Text>

						{/* Identifier Display */}
						<Text className="text-2xl font-bold text-center my-2 text-gray-900">
							{identifierDisplay}
						</Text>

						<Text className="text-xl text-center leading-6 text-gray-700">
							của bạn
						</Text>
					</View>

					{/* OTP Input */}
					<View className="items-center mb-4">
						<OtpInput
							key={otpKey}
							numberOfDigits={6}
							onTextChange={setOtp}
							onFilled={(text) => setOtp(text)}
							theme={{
								containerStyle: {
									gap: 8,
								},
								pinCodeContainerStyle: {
									width: 48,
									height: 56,
									borderWidth: 1,
									borderColor: '#D1D5DB',
									borderRadius: 10,
								},
								pinCodeTextStyle: {
									fontSize: 18,
									color: '#111827',
								},
								focusedPinCodeContainerStyle: {
									borderColor: Colors.light.PRIMARY_500,
									borderWidth: 2,
								},
							}}
						/>
						<Pressable
							className="px-4 rounded mb-4 w-full items-center mt-4"
							onPress={() => {
								setOtp('');
								setOtpKey((prev) => prev + 1);
							}}
						>
							<Text className="text-gray-700 text-lg">Xóa</Text>
						</Pressable>
					</View>

					{/* Next Button */}
					<ShareButton
						title="Tiếp tục"
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
