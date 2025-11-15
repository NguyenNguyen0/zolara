import React, { useState } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import { APP_COLOR } from '@/src/utils/constants';
import ShareQuestion from '@/src/components/button/share.question';
import ShareBack from '@/src/components/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginEmail() {
	const { t } = useTranslation('login-email');
	const router = useRouter();
	const [email, setEmail] = useState('');

	const handleNext = () => {
		console.log('Login Email:', {
			email,
			isLogin: 1,
		});
		router.navigate({
			pathname: '/(screens)/(auth)/confirm.password',
			params: { email, isLogin: 1 },
		});
	};

	const isNextDisabled = !email.trim(); // TODO: validate to allow next later

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<ShareBack/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text className="text-3xl font-bold text-center mb-10 text-dark-mode dark:text-light-mode">
						{t('title')}
					</Text>

					{/* Email Input */}
					<View className="mb-8">
						<ShareInput
							value={email}
							onTextChange={setEmail}
							keyboardType="email-address"
							placeholder={t('emailPlaceholder')}
							// touched={true}
							// error={t('emailError')}
						/>
					</View>

					{/* Next Button */}
					<ShareButton
						title={t('nextButton')}
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
							questionText={t('noAccount')}
							linkName={t('createAccount')}
							path=""
							onPress={() => {
								router.replace('/(screens)/(auth)/signup.email');
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
