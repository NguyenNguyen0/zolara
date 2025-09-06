import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
	const router = useRouter();
	const { t } = useTranslation('not-found');

	const handleGoHome = () => {
		router.replace('/');
	};

	const handleGoBack = () => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace('/');
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: t('title') }} />
			<View className="flex-1 justify-center items-center bg-gray-50 p-5">
				<View className="mb-5">
					<Ionicons name="sad-outline" size={120} color="#6B7280" />
				</View>

				<Text className="text-7xl font-black text-gray-200 mb-2.5 text-center">
					{t('errorCode')}
				</Text>
				<Text className="text-2xl font-bold text-gray-900 mb-2.5 text-center">
					{t('subtitle')}
				</Text>
				<Text className="text-base text-gray-500 text-center leading-6 max-w-xs mb-10">
					{t('description')}
				</Text>

				<View className="w-full max-w-xs gap-3">
					<Pressable
						className="flex-row items-center justify-center py-3 px-6 bg-blue-500 rounded-lg min-h-12"
						onPress={handleGoHome}
					>
						<Ionicons
							name="home"
							size={20}
							color="white"
							style={{ marginRight: 8 }}
						/>
						<Text className="text-white text-base font-semibold">
							{t('buttons.goHome')}
						</Text>
					</Pressable>

					<Pressable
						className="flex-row items-center justify-center py-3 px-6 bg-transparent border border-gray-300 rounded-lg min-h-12"
						onPress={handleGoBack}
					>
						<Ionicons
							name="arrow-back"
							size={20}
							color="#3B82F6"
							style={{ marginRight: 8 }}
						/>
						<Text className="text-blue-500 text-base font-semibold">
							{t('buttons.goBack')}
						</Text>
					</Pressable>
				</View>
			</View>
		</>
	);
}