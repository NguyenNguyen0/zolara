import ShareBack from '@/components/customize/button/share.back';
import ShareButton from '@/components/customize/button/share.button';
import ShareQuestion from '@/components/customize/button/share.question';
import ShareInput from '@/components/customize/input/share.input';
import { useAuthStore } from '@/store/authStore';
import { APP_COLOR } from '@/utils/constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmPassword() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuthStore();

	const identifier = (params.identifier as string) || (params.email as string);
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const isEmail = (value: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	};

	const isPhoneNumber = (value: string) => {
		return /^[0-9]{10}$/.test(value);
	};

	const handleNext = async () => {
		if (!password) {
			Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
			return;
		}

		if (isLogin) {
			if (!identifier) {
				Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
				return;
			}

			if (!isEmail(identifier) && !isPhoneNumber(identifier)) {
				Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại hợp lệ');
				return;
			}

			setIsLoading(true);
			try {
				await login(identifier, password);
				router.dismissAll();
				router.replace({
					pathname: '/(screens)/(auth)/login.success',
					params: { identifier, password, isLogin: 1, isSignup: 0 },
				});
			} catch (error: any) {
				const errorMessage = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại';
				Alert.alert(
					'Đăng nhập thất bại',
					'Email/Số điện thoại hoặc mật khẩu không đúng.',
				);
			} finally {
				setIsLoading(false);
			}
		} else if (isSignup) {
			// Signup - chuyển đến màn hình nhập name
			router.dismissAll();
			router.replace({
				pathname: '/(screens)/(auth)/signup.name',
				params: { email: identifier, password, isLogin: 0, isSignup: 1 },
			});
		}
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ShareBack />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-xl text-center mb-2 text-gray-900">
						Nhập mật khẩu
					</Text>

					{/* Identifier Display */}
					<Text className="text-2xl font-bold text-center mb-10 text-gray-900">
						{identifier || 'Unknown'}
					</Text>

					{/* Password Input */}
					<View className="mb-8">
						<ShareInput
							value={password}
							onTextChange={setPassword}
							secureTextEntry={true}
							placeholder="Nhập mật khẩu ..."
						/>
					</View>

					{/* Next Button */}
					<View>
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
							isLoading={isLoading}
						/>
					</View>

					{/* Forgot Password Link - Only show for login flow */}
					{isLogin && (
						<View className="flex-row items-center justify-center mt-5">
							<ShareQuestion
								questionText=""
								linkName="Lấy lại mật khẩu"
								path=""
								onPress={() => {
									router.navigate('/(screens)/(auth)/forgot/forgotPasswordIdentifierScreen' as any);
								}}
							/>
						</View>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
