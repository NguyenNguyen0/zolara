import React, { useState } from 'react';
import {
	View,
	Text,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import ShareButton from '@/src/components/button/share.button';
import ShareQuestion from '@/src/components/button/share.question';
import ShareAvatar from '@/src/components/input/share.avatar';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpAvatar() {
	const router = useRouter();
	const { t } = useTranslation('signup-avatar');
	const { isDark } = useTheme();
	const params = useLocalSearchParams();

	const name = params.name as string;
	const email = params.email as string;
	const password = params.password as string;
	const otp = params.otp as string;
	const birthday = params.birthday as string;
	const gender = params.gender as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const [imageUri, setImageUri] = useState<string | null>(null);

	const continueNext = () => {
		console.log('Signup Avatar - Complete:', {
			name,
			email,
			password,
			otp,
			birthday,
			gender,
			imageUri: imageUri ? imageUri : 'none',
			isLogin,
			isSignup
		});
		router.dismissAll();
		router.replace('/(screens)/(tabs)/conversation');
	};

	return (
		<SafeAreaView
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				<View className="flex-1">
					<Text
						className="text-3xl font-bold text-center mb-4 text-dark-mode dark:text-light-mode"
					>
						{t('title')}
					</Text>
					<Text
						className="text-[15px] text-center mb-10 text-dark-mode dark:text-light-mode opacity-70"
					>
						{t('subtitle')}
					</Text>

					<View className="items-center mb-10">
						<ShareAvatar
							imageUri={imageUri}
							onImageChange={setImageUri}
						/>
					</View>

					<View className="mb-4">
						<ShareButton
							title={t('nextButton')}
							onPress={continueNext}
							buttonStyle={{
								backgroundColor: APP_COLOR.PRIMARY,
							}}
							textStyle={{ color: APP_COLOR.LIGHT_MODE }}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
