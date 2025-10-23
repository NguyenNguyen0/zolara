import NavigateHeader from '@/src/components/commons/navigate.header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import ShareInput from '@/src/components/input/share.input';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

export default function AddFriend() {
	const { isDark } = useTheme();
	const [email, setEmail] = useState('');

	const handleAddFriend = () => {
		console.log('=== ADD FRIEND ===');
		console.log('Email:', email);
		setEmail('');
		router.navigate('/(screens)/(user)/[id]');
	};

	return (
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<NavigateHeader
				showBackButton
				title={'Thêm bạn'}
				showQRScanner
			/>

			<ScrollView className="flex-1">
				<View className="p-4">
					{/* Email Input Section */}
					<View className="mb-6">
						<Text className={`text-base font-semibold mb-3 ${isDark ? 'text-light-mode' : 'text-dark-mode'}`}>
							Tìm kiếm bạn bè qua email
						</Text>
						<View className="flex-row items-center gap-2">
							<View className="flex-1">
								<ShareInput
									value={email}
									onTextChange={setEmail}
									placeholder="Nhập email"
									keyboardType="email-address"
									inputStyle={{
										backgroundColor: isDark ? APP_COLOR.GRAY_800 : APP_COLOR.GRAY_100,
										borderColor: isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_300,
									}}
									placeholderTextColor={isDark ? APP_COLOR.GRAY_500 : APP_COLOR.GRAY_400}
								/>
							</View>
							
							<TouchableOpacity
								onPress={handleAddFriend}
								activeOpacity={0.7}
								className="w-12 h-12 rounded-full items-center justify-center"
								style={{ backgroundColor: APP_COLOR.PRIMARY }}
							>
								<MaterialIcons name="arrow-forward" size={24} color="white" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Info Text */}
					<View className="mt-4">
						<Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							Nhập địa chỉ email của người bạn muốn kết bạn. Chúng tôi sẽ gửi lời mời kết bạn đến họ.
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
