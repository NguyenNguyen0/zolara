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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ShareButton from '@/src/components/button/share.button';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareDatePicker from '@/src/components/input/share.datepicker';
import ShareDropdown from '@/src/components/input/share.dropdown';

export default function SignUpDetail() {
	const { t } = useTranslation('signup-detail');
	const { t: tGender } = useTranslation('gender');
	const router = useRouter();
	const { isDark } = useTheme();

	const [birthday, setBirthday] = useState('');
	const [gender, setGender] = useState('other');

	// Gender options data
	const genderOptions = [
		{ label: tGender('male'), value: 'male' },
		{ label: tGender('female'), value: 'female' },
		{ label: tGender('other'), value: 'other' },
	];

	const handleContinue = () => {
		console.log('Birthday:', birthday, 'Gender:', gender);
		router.navigate({
            pathname: '/(screens)/(auth)/signup.avatar',
            // params: { name },
        });
	};

	const isNextDisabled = !birthday.trim() || !gender.trim();
	const [date, setDate] = React.useState(new Date());

	const formatDate = (d: Date) => {
		try {
			return d.toLocaleDateString('vi-VN');
		} catch {
			const day = String(d.getDate()).padStart(2, '0');
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const year = d.getFullYear();
			return `${day}/${month}/${year}`;
		}
	};

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
			}}
		>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

			<View className="flex-row items-center px-5 py-10">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons
						name="arrow-back"
						size={24}
						color={isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE}
					/>
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 px-5"
			>
				<View>
					<Text
						className="text-3xl font-bold text-center mb-10"
						style={{
							color: isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE,
						}}
					>
						{t('title')}
					</Text>

					<View className="mb-8">
						<ShareDropdown
							data={genderOptions}
							value={gender}
							onChange={setGender}
							placeholder={tGender('placeholder')}
							search={false}
						/>
					</View>

					<View className="mb-8">
						<ShareDatePicker
							value={date}
							onChange={(d) => {
								setDate(d);
								setBirthday(formatDate(d));
							}}
							placeholder={t('birthdayLabel')}
						/>
					</View>

					<ShareButton
						title={t('continueButton')}
						onPress={handleContinue}
						disabled={isNextDisabled}
						buttonStyle={{
							backgroundColor: isNextDisabled
								? APP_COLOR.GRAY_300
								: APP_COLOR.PRIMARY,
							borderColor: isNextDisabled
								? APP_COLOR.GRAY_300
								: APP_COLOR.PRIMARY,
							width: '100%',
							alignSelf: 'stretch',
							justifyContent: 'center',
						}}
						textStyle={{
							color: isNextDisabled ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
							fontSize: 18,
							fontWeight: '600',
						}}
						pressStyle={{ alignSelf: 'stretch' }}
					/>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
