import ShareButton from '@/components/customize/button/share.button';
import { useAuthStore } from '@/store/authStore';
import { APP_COLOR } from '@/utils/constants';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginSuccess = () => {
	const params = useLocalSearchParams();
	const { user, userInfo, fetchUserInfo } = useAuthStore();

	useEffect(() => {
		// Fetch user info khi component mount
		if (user && !userInfo) {
			fetchUserInfo();
		}
	}, [user]);

	const handleDone = () => {
		router.replace('/(screens)/(tabs)');
	};

	// Lấy tên từ userInfo hoặc user
	const displayName = userInfo?.fullName || user?.fullName || 'User';

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 px-5 mt-32">
				{/* Title */}
				<Text className="text-3xl font-bold text-center mb-8 text-gray-900">
					Đăng nhập thành công
				</Text>

				{/* Main Content */}
				<View className="flex-1 items-center justify-center">
					<View className="relative mb-5">
						{userInfo?.profilePictureUrl ? (
							<Image
								source={{ uri: userInfo.profilePictureUrl }}
								className="w-40 h-40 rounded-full"
								resizeMode='cover'
							/>
						) : (
							<Image
								source={require('@/assets/images/brand/zolara.png')}
								className="w-40 h-40"
								resizeMode='contain'
							/>
						)}
					</View>

					<Text className="text-2xl font-semibold mb-2 text-center text-gray-900">
						{displayName}
					</Text>
					<Text className="text-base text-center text-gray-600">
						Chào mừng bạn trở lại!
					</Text>
				</View>

				{/* Bottom Action */}
				<View className="mb-16">
					<ShareButton
						title="Hoàn tất"
						onPress={handleDone}
						buttonStyle={{ backgroundColor: APP_COLOR.PRIMARY }}
						textStyle={{ color: APP_COLOR.LIGHT_MODE }}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default LoginSuccess;
