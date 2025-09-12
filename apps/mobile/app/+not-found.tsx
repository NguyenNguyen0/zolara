import { Stack, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import ShareButton from '@/src/components/button/share.button';

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
				style={{
					backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
				}}
			>
				<View className="mb-5">
					<Ionicons
						name="sad-outline"
						size={120}
						color={
							isDark ? APP_COLOR.GRAY_200 : APP_COLOR.GRAY_700
						}
					/>
				</View>

				<Text
					className="text-7xl font-black mb-2.5 text-center"
					style={{ color: isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE }}
				>
					{t('errorCode')}
				</Text>
				<Text
					className="text-2xl font-bold mb-2.5 text-center"
					style={{ color: isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE }}
				>
					{t('subtitle')}
				</Text>
				<Text
					className="text-base text-center leading-6 max-w-xs mb-10"
					style={{
						color: isDark
							? APP_COLOR.GRAY_200
							: APP_COLOR.GRAY_700,
					}}
				>
					{t('description')}
				</Text>

				<View className="w-full max-w-xs gap-3">
					<ShareButton
						title={t('buttons.goHome')}
						onPress={handleGoHome}
						icon={
							<Ionicons
								name="home"
								size={20}
								color={APP_COLOR.LIGHT_MODE}
							/>
						}
						buttonStyle={{
							backgroundColor: APP_COLOR.PRIMARY,
							borderRadius: 8,
							paddingVertical: 12,
							paddingHorizontal: 24,
							minHeight: 48,
							justifyContent: 'center',
							width: '100%',
						}}
						textStyle={{
							color: APP_COLOR.LIGHT_MODE,
							fontSize: 16,
							fontWeight: '600',
						}}
					/>

					<ShareButton
						title={t('buttons.goBack')}
						onPress={handleGoBack}
						icon={
							<Ionicons
								name="arrow-back"
								size={20}
								color={APP_COLOR.DARK_MODE}
							/>
						}
						buttonStyle={{
							backgroundColor: APP_COLOR.GRAY_200,
							borderWidth: 1,
							borderColor: isDark
								? APP_COLOR.GRAY_700
								: APP_COLOR.GRAY_200,
							borderRadius: 8,
							paddingVertical: 12,
							paddingHorizontal: 24,
							minHeight: 48,
							justifyContent: 'center',
							width: '100%',
						}}
						textStyle={{
							color: APP_COLOR.DARK_MODE,
							fontSize: 16,
							fontWeight: '600',
						}}
					/>
				</View>
			</View>
		</>
	);
}
