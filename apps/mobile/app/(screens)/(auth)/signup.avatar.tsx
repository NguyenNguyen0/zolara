import React, { useState } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import ShareButton from '@/src/components/button/share.button';
import ShareQuestionButton from '@/src/components/button/share.question';
import ShareAvatar from '@/src/components/input/share.avatar';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';

export default function SignUpAvatar() {
	const router = useRouter();
	const { t } = useTranslation('signup-avatar');
	const { isDark } = useTheme();

	const [imageUri, setImageUri] = useState<string | null>(null);

	const continueNext = () => {
		// In the future, we will persist the image to backend or storage
		router.navigate('/(screens)/(tabs)');
	};

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: isDark ? APP_COLOR.DARK : APP_COLOR.LIGHT }}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5 mt-32"
			>
				<View className="flex-1">
					<Text
						className="text-3xl font-bold text-center mb-4"
						style={{ color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK }}
					>
						{t('title')}
					</Text>
					<Text
						className="text-[15px] text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
							opacity: 0.7,
						}}
					>
						{t('subtitle')}
					</Text>

					<View className="items-center mb-10">
						<ShareAvatar
							imageUri={imageUri}
							onImageChange={setImageUri}
							size={150}
							placeholderInitials={t('placeholderInitials')}
						/>
					</View>

					<View className="mb-4">
						<ShareButton
							title={t('updateButton')}
							onPress={continueNext}
							buttonStyle={{
								backgroundColor: APP_COLOR.PRIMARY,
								borderColor: APP_COLOR.PRIMARY,
								width: '100%',
								alignSelf: 'stretch',
								justifyContent: 'center',
							}}
							textStyle={{ color: APP_COLOR.LIGHT, fontSize: 18, fontWeight: '600' }}
							pressStyle={{ alignSelf: 'stretch' }}
						/>
					</View>

					<View className="flex-row items-center justify-center">
						<ShareQuestionButton
							questionText={''}
							linkName={t('skipButton')}
							path="/(screens)/(tabs)"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
