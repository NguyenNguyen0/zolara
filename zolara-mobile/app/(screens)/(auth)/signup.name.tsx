import React, { useState } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ShareInput from '@/components/customize/input/share.input';
import ShareButton from '@/components/customize/button/share.button';
import { APP_COLOR } from '@/utils/constants';
import ShareQuestion from '@/components/customize/button/share.question';
import ShareBack from '@/components/customize/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpName() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [fullName, setFullName] = useState('');

	const email = params.email as string;
	const password = params.password as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const handleContinue = () => {
		if (!fullName.trim()) {
			Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn');
			return;
		}

		router.navigate({
			pathname: '/(screens)/(auth)/signup.detail',
			params: {
				name: fullName,
				email,
				password,
				isLogin: isLogin ? 1 : 0,
				isSignup: isSignup ? 1 : 0,
			},
		});
	};

	const isContinueDisabled = !fullName.trim();

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ShareBack />
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View className="flex-1">
					{/* Title */}
					<Text className="text-3xl font-bold text-center mb-4 text-gray-900">
						NHẬP TÊN Zolara CỦA BẠN
					</Text>

					{/* Subtitle */}
					<Text className="text-[15px] text-center mb-10 text-gray-600 opacity-70">
						Sử dụng tên thật của bạn để dễ dàng kết nối hơn
					</Text>

					{/* Name Input */}
					<View className="mb-8">
						<ShareInput
							value={fullName}
							onTextChange={setFullName}
							keyboardType="default"
							placeholder="Nguyễn Văn A ..."
						/>
					</View>

					{/* Name Rules */}
					<View className="mb-8">
						<Text className="text-gray-500 text-left w-full pl-6 pt-2">
							• Độ dài: 2 đến 40 ký tự
						</Text>
						<Text className="text-gray-500 text-left w-full pl-6 pt-2">
							• Không có số
						</Text>
						<Text className="text-gray-500 text-left w-full pl-6 pt-2">
							• Tuân thủ Zolara's naming policy
						</Text>
					</View>

					{/* Continue Button */}
					<View className="mb-8">
						<ShareButton
							title="Tiếp tục"
							onPress={handleContinue}
							disabled={isContinueDisabled}
							buttonStyle={{
								backgroundColor: isContinueDisabled
									? APP_COLOR.GRAY_200
									: APP_COLOR.PRIMARY,
							}}
							textStyle={{
								color: isContinueDisabled
									? APP_COLOR.DARK_MODE
									: APP_COLOR.LIGHT_MODE,
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
