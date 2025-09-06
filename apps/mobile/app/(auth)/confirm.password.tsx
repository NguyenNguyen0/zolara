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

	const handleNext = () => {
		// TODO: Implement navigation to next step
		console.log(
			'Password:',
			password,
			'Email:',
			email,
			'IsLogin:',
			isLogin,
		);
		router.replace({
			pathname: '/(auth)/verify',
			params: { email, password, isLogin: 1 },
		});
	};

	const isNextDisabled = !password.trim();

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.WHITE,
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			{/* Header with back button */}
			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={isDark ? APP_COLOR.WHITE : APP_COLOR.DARK}
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
							color: isDark ? APP_COLOR.WHITE : APP_COLOR.DARK,
						}}
					>
						{t('title')}
					</Text>

					{/* Email Display */}
					<Text
						className="text-3xl font-bold text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.WHITE : APP_COLOR.DARK,
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
								? '#cccc'
								: APP_COLOR.PRIMARY,
							borderColor: isNextDisabled
								? '#cccc'
								: APP_COLOR.PRIMARY,
							width: '100%',
							alignSelf: 'stretch',
							justifyContent: 'center',
						}}
						textStyle={{
							color: isNextDisabled ? 'black' : APP_COLOR.WHITE,
							fontSize: 18,
							fontWeight: '600',
						}}
						pressStyle={{
							alignSelf: 'stretch',
						}}
					/>

					{/* Forgot Password Link */}
					<ShareQuestionLink
						questionText=""
						linkName={t('forgotPassword')}
						path="/(auth)/forgot-password"
						questionColor={isDark ? 'white' : 'black'}
						linkColor={APP_COLOR.PRIMARY}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
