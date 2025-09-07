import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/contexts/ThemeContext';
import { APP_COLOR } from '@/src/utils/constants';

export default function NotFoundScreen() {
	const router = useRouter();
	const { t } = useTranslation('not-found');
	const { isDark } = useTheme();

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
			<View 
				className="flex-1 justify-center items-center p-5"
				style={{ backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.GREYLIGHT }}
			>
				<View className="mb-5">
					<Ionicons 
						name="sad-outline" 
						size={120} 
						color={isDark ? APP_COLOR.GREYLIGHT : APP_COLOR.GREYDARK} 
					/>
				</View>

				<Text 
					className="text-7xl font-black mb-2.5 text-center"
					style={{ color: isDark ? APP_COLOR.GREYDARK : APP_COLOR.GREYLIGHT }}
				>
					{t('errorCode')}
				</Text>
				<Text 
					className="text-2xl font-bold mb-2.5 text-center"
					style={{ color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK }}
				>
					{t('subtitle')}
				</Text>
				<Text 
					className="text-base text-center leading-6 max-w-xs mb-10"
					style={{ color: isDark ? APP_COLOR.GREYLIGHT : APP_COLOR.GREYDARK }}
				>
					{t('description')}
				</Text>

				<View className="w-full max-w-xs gap-3">
					<Pressable
						className="flex-row items-center justify-center py-3 px-6 rounded-lg min-h-12"
						style={{ backgroundColor: APP_COLOR.PRIMARY }}
						onPress={handleGoHome}
					>
						<Ionicons
							name="home"
							size={20}
							color={APP_COLOR.LIGHT}
							style={{ marginRight: 8 }}
						/>
						<Text 
							className="text-base font-semibold"
							style={{ color: APP_COLOR.LIGHT }}
						>
							{t('buttons.goHome')}
						</Text>
					</Pressable>

					<Pressable
						className="flex-row items-center justify-center py-3 px-6 bg-transparent border rounded-lg min-h-12"
						style={{ 
							borderColor: isDark ? APP_COLOR.GREYDARK : APP_COLOR.GREYLIGHT 
						}}
						onPress={handleGoBack}
					>
						<Ionicons
							name="arrow-back"
							size={20}
							color={APP_COLOR.PRIMARY}
							style={{ marginRight: 8 }}
						/>
						<Text 
							className="text-base font-semibold"
							style={{ color: APP_COLOR.PRIMARY }}
						>
							{t('buttons.goBack')}
						</Text>
					</Pressable>
				</View>
			</View>
		</>
	);
}