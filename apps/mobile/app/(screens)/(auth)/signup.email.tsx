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
import ShareQuestionButton from '@/src/components/button/share.question';

export default function SignUpEmail() {
	const { t } = useTranslation('signup-email');
	const router = useRouter();
	const { isDark } = useTheme();
	const [email, setEmail] = useState('');
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [agreeToSocialTerms, setAgreeToSocialTerms] = useState(false);

	const handleNext = () => {
		// TODO: Implement navigation to next step
		router.navigate({
			pathname: '/(screens)/(auth)/confirm.password',
			params: { email, isSignup: 1 },
		});
	};

	const isNextDisabled =
		!email.trim() || !agreeToTerms || !agreeToSocialTerms;

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.LIGHT,
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text
						className="text-3xl font-bold text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
						}}
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
							inputStyle={{
								backgroundColor: isDark
									? APP_COLOR.GREYLIGHT
									: 'transparent',
							}}
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
								isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK
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
								isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK
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
								? APP_COLOR.GREY
								: APP_COLOR.PRIMARY,
							borderColor: isNextDisabled
								? APP_COLOR.GREY
								: APP_COLOR.PRIMARY,
							width: '100%',
							alignSelf: 'stretch',
							justifyContent: 'center',
						}}
						textStyle={{
							color: isNextDisabled ? 'black' : APP_COLOR.LIGHT,
							fontSize: 18,
							fontWeight: '600',
						}}
						pressStyle={{
							alignSelf: 'stretch',
						}}
					/>

					{/* Login Link */}
					<View className='flex-row items-center justify-center mt-5'>
						<ShareQuestionButton
							questionText={t('alreadyHaveAccount')}
							linkName={t('loginLink')}
							path="/(auth)/login.email"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
