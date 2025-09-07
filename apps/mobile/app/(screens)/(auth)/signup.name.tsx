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

export default function SignUpName() {
	const { t } = useTranslation('signup-name');
	const router = useRouter();
	const { isDark } = useTheme();
	const [name, setName] = useState('Nguyễn Văn Minh');

	const handleContinue = () => {
		router.replace({
            pathname: '/(screens)/(tabs)',
            params: { name },
        });
	};

	const isContinueDisabled = !name.trim();

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
				<View className="flex-1">
					{/* Title */}
					<Text
						className="text-3xl font-bold text-center mb-4"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
						}}
					>
						{t('title')}
					</Text>

					{/* Subtitle */}
					<Text
						className="text-base text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.LIGHT : APP_COLOR.DARK,
							opacity: 0.7,
						}}
					>
						{t('subtitle')}
					</Text>

					{/* Name Input */}
					<View className="mb-6">
						<ShareInput
							value={name}
							onTextChange={setName}
							keyboardType="default"
							placeholder={t('namePlaceholder')}
							inputStyle={{
								backgroundColor: isDark
									? APP_COLOR.GREYLIGHT
									: 'transparent',
							}}
						/>
					</View>

					{/* Name Rules */}
					<View className="mb-8">
						<ShareQuestionButton
							questionText={`• ${t('rule1')}`}
							linkName={''}
							path="/(auth)/login.email"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
						<ShareQuestionButton
							questionText={`• ${t('rule2')}`}
							linkName={''}
							path="/(auth)/login.email"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
						<ShareQuestionButton
							questionText={`• ${t('rule3')}`}
							linkName={t('rule3Link')}
							path="/name-rules"
							questionColor={isDark ? 'white' : 'black'}
							linkColor={APP_COLOR.PRIMARY}
						/>
					</View>

					{/* Continue Button */}
					<View className="flex-1 justify-end mb-10">
						<ShareButton
							title={t('continueButton')}
							onPress={handleContinue}
							disabled={isContinueDisabled}
							buttonStyle={{
								backgroundColor: isContinueDisabled
									? APP_COLOR.GREY
									: APP_COLOR.PRIMARY,
								borderColor: isContinueDisabled
									? APP_COLOR.GREY
									: APP_COLOR.PRIMARY,
								width: '100%',
								alignSelf: 'stretch',
								justifyContent: 'center',
							}}
							textStyle={{
								color: isContinueDisabled
									? 'black'
									: APP_COLOR.LIGHT,
								fontSize: 18,
								fontWeight: '600',
							}}
							pressStyle={{
								alignSelf: 'stretch',
							}}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
