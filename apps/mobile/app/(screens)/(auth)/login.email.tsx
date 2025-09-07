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
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareQuestionButton from '@/src/components/button/share.question';

export default function LoginEmail() {
	const { t } = useTranslation('login-email');
	const router = useRouter();
	const { isDark } = useTheme();
	const [email, setEmail] = useState('');

	const handleNext = () => {
		// TODO: Implement navigation to next step
		router.navigate({
			pathname: '/(screens)/(auth)/confirm.password',
			params: { email, isLogin: 1 },
		});
	};

	const isNextDisabled = !email.trim(); // TODO: validate to allow next later

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
					<View className="mb-8">
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

					{/* Create Account Link */}
					<View className="flex-row items-center justify-center mt-5">
						<ShareQuestionButton
							questionText={t('noAccount')}
							linkName={t('createAccount')}
							path="/(auth)/signup.email"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
