import React, { useState } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import ShareInput from '@/components/customize/input/share.input';
import ShareButton from '@/components/customize/button/share.button';
import { APP_COLOR } from '@/utils/constants';
import ShareQuestion from '@/components/customize/button/share.question';
import ShareBack from '@/components/customize/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginEmail() {
	const router = useRouter();
	const [identifier, setIdentifier] = useState('');

	const isEmail = (value: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	};

	const isPhoneNumber = (value: string) => {
		return /^[0-9]{10}$/.test(value);
	};

	const handleNext = () => {
		if (!identifier.trim()) {
			return;
		}

		if (!isEmail(identifier) && !isPhoneNumber(identifier)) {
			return;
		}

		router.navigate({
			pathname: '/(screens)/(auth)/confirm.password',
			params: { identifier, isLogin: 1 },
		});
	};

	const isNextDisabled = !identifier.trim();

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ShareBack/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-3xl font-bold text-center mb-10 text-gray-900">
						Đăng nhập
					</Text>

					{/* Email/Phone Input */}
					<View className="mb-8">
						<ShareInput
							value={identifier}
							onTextChange={setIdentifier}
							keyboardType="default"
							placeholder="Nhập email hoặc số điện thoại ..."
						/>
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

					{/* Create Account Link */}
					<View className="flex-row items-center justify-center mt-5">
						<ShareQuestion
							questionText="Bạn chưa có tài khoản? "
							linkName="Đăng ký"
							path=""
							onPress={() => {
								router.replace('/(screens)/(auth)/signup.email');
							}}
						/>
					</View>
					<View className="flex-row items-center justify-center">
						<ShareQuestion
							questionText="Bạn đã có tài khoản đã quên? "
							linkName="Quên mật khẩu"
							path=""
							onPress={() => {
								router.replace('/(screens)/(auth)/forgot/forgotPasswordIdentifierScreen' as any);
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
