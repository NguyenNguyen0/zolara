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

export default function SignUpEmail() {
	const { t } = useTranslation('signup-email');
	const router = useRouter();
	const [email, setEmail] = useState('');

	const handleNext = () => {
		console.log('Signup Email:', {
			email,
			isSignup: 1,
		});
		router.navigate({
			pathname: '/(screens)/(auth)/confirm.password',
			params: { email, isSignup: 1 },
		});
	};

	const isNextDisabled =
		!email.trim();

	return (
		<SafeAreaView
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<ShareBack/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text
						className="text-3xl font-bold text-center mb-10 text-dark-mode dark:text-light-mode"
					>
						{t('title')}
					</Text>

					{/* Email Input */}
					<View className="mb-6">
						<ShareInput
							value={email}
							onTextChange={setEmail}
							keyboardType="email-address"
							placeholder={t('emailPlaceholder')}
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
							color: isNextDisabled ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
						}}
					/>

					{/* Login Link */}
					<View className='flex-row items-center justify-center mt-5'>
						<ShareQuestion
							questionText={t('alreadyHaveAccount')}
							linkName={t('loginLink')}
							path=""
							onPress={() => {
								router.replace('/(screens)/(auth)/login.email');
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
