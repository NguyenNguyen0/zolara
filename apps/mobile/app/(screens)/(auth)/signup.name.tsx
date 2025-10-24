import React, { useState } from 'react';
import {
	View,
	Text,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareQuestion from '@/src/components/button/share.question';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpName() {
	const { t } = useTranslation('signup-name');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();
	const [name, setName] = useState('');

	const email = params.email as string;
	const password = params.password as string;
	const otp = params.otp as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const handleContinue = () => {
		router.navigate({
			pathname: '/(screens)/(auth)/signup.detail',
			params: {
				name,
				email,
				password,
				otp,
				isLogin: isLogin ? 1 : 0,
				isSignup: isSignup ? 1 : 0,
			},
		});

		console.log('Signup Name - Continue:', {
			name,
			email,
			password,
			isLogin,
			isSignup
		});
	};

	const isContinueDisabled = !name.trim();

	return (
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				{/* Content Container */}
				<View className="flex-1">
					{/* Title */}
					<Text className="text-3xl font-bold text-center mb-4 text-dark-mode dark:text-light-mode">
						{t('title')}
					</Text>

					{/* Subtitle */}
					<Text className="text-[15px] text-center mb-10 text-dark-mode dark:text-light-mode opacity-70">
						{t('subtitle')}
					</Text>

					{/* Name Input */}
					<View className="mb-8">
						<ShareInput
							value={name}
							onTextChange={setName}
							keyboardType="default"
							placeholder={t('namePlaceholder')}
						/>
					</View>

					{/* Name Rules */}
					<View className="mb-8">
						<ShareQuestion
							questionText={`• ${t('rule1')}`}
							linkName={''}
							path="/(auth)/login.email"
						/>
						<ShareQuestion
							questionText={`• ${t('rule2')}`}
							linkName={''}
							path="/(auth)/login.email"
						/>
						<ShareQuestion
							questionText={`• ${t('rule3')}`}
							linkName={t('rule3Link')}
							path="/name-rules"
						/>
					</View>

					{/* Continue Button */}
					<View className="mb-8">
						<ShareButton
							title={t('continueButton')}
							onPress={handleContinue}
							disabled={isContinueDisabled}
							buttonStyle={{
								backgroundColor: isContinueDisabled
									? APP_COLOR.GRAY_200
									: APP_COLOR.PRIMARY,
							}}
							textStyle={{
								color: isContinueDisabled
									? APP_COLOR.DARK_MODE
									: APP_COLOR.LIGHT_MODE,
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
