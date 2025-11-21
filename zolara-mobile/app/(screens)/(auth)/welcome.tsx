import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShareButton from '@/components/customize/button/share.button';
import { APP_COLOR } from '@/utils/constants';
import { router } from 'expo-router';

export default function Welcome() {
	const handleLogin = () => {
		router.navigate('/(screens)/(auth)/login.email');
	};

	const handleSignup = () => {
		router.navigate('/(screens)/(auth)/signup.email');
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Content Container */}
			<View className="flex-1 justify-between">
				{/* Logo Section - Takes up most of the space */}
				<View className="flex-1 justify-center items-center px-8">
					<Image
						source={require('@/assets/images/brand/zolara.png')}
						resizeMode="contain"
						style={{ width: 200, height: 200 }}
					/>
				</View>

				{/* Bottom Section */}
				<View className="px-6 pb-8 mb-10">
					{/* Buttons Section */}
					<View className="gap-5">
						{/* Login */}
						<ShareButton
							title="ĐĂNG NHẬP"
							onPress={handleLogin}
							buttonStyle={{ backgroundColor: APP_COLOR.PRIMARY }}
							textStyle={{ color: APP_COLOR.LIGHT_MODE }}
						/>
						{/* Create */}
						<ShareButton
							title="ĐĂNG KÝ"
							onPress={handleSignup}
							buttonStyle={{ backgroundColor: '#f3f4f6' }}
							textStyle={{ color: '#000000' }}
						/>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
