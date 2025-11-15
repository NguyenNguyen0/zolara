import { Stack, useRouter } from 'expo-router';
import { View, Text, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { APP_COLOR } from '@/src/utils/constants';
import ShareButton from '@/src/components/button/share.button';

const { width } = Dimensions.get('window');

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
			<View
				className="flex-1 items-center bg-light-mode dark:bg-dark-mode"
			>
				<View className="w-full mb-5">
					<Image
						source={require('@/src/assets/default/404.gif')}
						style={{ width: width, height: width * 0.8 }}
						resizeMode="contain"
					/>
				</View>

				<Text
					className="text-6xl font-black mb-2.5 text-center"
					style={{ color: APP_COLOR.GRAY_400 }}
				>
					{t('errorCode')}
				</Text>
				<Text
					className="text-2xl font-bold mb-2.5 text-center text-dark-mode dark:text-light-mode"
				>
					{t('subtitle')}
				</Text>
				<Text
					className="text-base text-center leading-6 max-w-xs mb-5 dark:text-light-mode text-dark-mode"
				>
					{t('description')}
				</Text>

				<View className="w-full max-w-xs gap-3">
					<ShareButton
						title={t('buttons.goHome')}
						onPress={handleGoHome}
						buttonStyle={{
							backgroundColor: APP_COLOR.PRIMARY,
						}}
						textStyle={{
							color: APP_COLOR.LIGHT_MODE,
						}}
					/>

					<ShareButton
						title={t('buttons.goBack')}
						onPress={handleGoBack}
					/>
				</View>
			</View>
		</>
	);
}
