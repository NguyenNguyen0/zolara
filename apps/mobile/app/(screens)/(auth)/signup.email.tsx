import React, { useState } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import ShareRadio from '@/src/components/button/share.radio';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareQuestion from '@/src/components/button/share.question';
import ShareBack from '@/src/components/button/share.back';

export default function SignUpEmail() {
	const { t } = useTranslation('signup-email');
	const router = useRouter();
	const { isDark } = useTheme();
	const [email, setEmail] = useState('');
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [agreeToSocialTerms, setAgreeToSocialTerms] = useState(false);

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
		!email.trim() || !agreeToTerms || !agreeToSocialTerms;

	return (
		<SafeAreaView
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={
					isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE
				}
			/>

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

					{/* Terms of Service Checkboxes */}
					<View className="mb-6">
						{/* Terms of Service */}
						<ShareRadio
							isChecked={agreeToTerms}
							onRadioPress={() => setAgreeToTerms(!agreeToTerms)}
							questionText={t('termsOfService')}
							linkText={t('termsOfServiceLink')}
							linkPath="/terms-of-service"
							questionColor={
								isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE
							}
							linkColor={APP_COLOR.PRIMARY}
							radioColor={APP_COLOR.PRIMARY}
						/>

						{/* Social Terms of Service */}
						<ShareRadio
							isChecked={agreeToSocialTerms}
							onRadioPress={() =>
								setAgreeToSocialTerms(!agreeToSocialTerms)
							}
							questionText={t('socialTermsOfService')}
							linkText={t('socialTermsOfServiceLink')}
							linkPath="/social-terms-of-service"
							questionColor={
								isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE
							}
							linkColor={APP_COLOR.PRIMARY}
							radioColor={APP_COLOR.PRIMARY}
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
