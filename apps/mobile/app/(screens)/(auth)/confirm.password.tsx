import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ShareInput from '@/src/components/input/share.input';
import ShareButton from '@/src/components/button/share.button';
import ShareQuestionLink from '@/src/components/button/share.question';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ConfirmPassword() {
	const { t } = useTranslation('confirm-password');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();
	const [password, setPassword] = useState('');

	const email = params.email as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	// Determine flow type
	const flowType = isLogin ? 'login' : isSignup ? 'signup' : 'unknown';

	const handleNext = () => {
		// TODO: Implement navigation to next step
		console.log(
			'Password:',
			password,
			'Email:',
			email,
			'FlowType:',
			flowType,
		);

		// Pass the correct flow type to verify screen
		const verifyParams: any = { email, password };
		if (isLogin) {
			verifyParams.isLogin = '1';
		} else if (isSignup) {
			verifyParams.isSignup = '1';
		}

		router.replace({
			pathname: '/(screens)/(auth)/verify',
			params: verifyParams,
		});
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.LIGHT,
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			{/* Header with back button */}
			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK}
					/>
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				{/* Content Container */}
				<View>
					{/* Title */}
					<Text
						className="text-xl text-center mb-2"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
						}}
					>
						{t('title')}
					</Text>

					{/* Email Display */}
					<Text
						className="text-3xl font-bold text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
						}}
					>
						{email ? email : 'Unknown Email'}
					</Text>

					{/* Password Input */}
					<View className="mb-8">
						<ShareInput
							value={password}
							onTextChange={setPassword}
							secureTextEntry={true}
							placeholder={t('passwordPlaceholder')}
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

					{/* Forgot Password Link - Only show for login flow */}
					{isLogin && (
						<ShareQuestionLink
							questionText=""
							linkName={t('forgotPassword')}
							path="/(auth)/forgot-password"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
