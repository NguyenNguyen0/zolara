import React, { useState } from 'react';
import {
	View,
	Text,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ShareButton from '@/src/components/button/share.button';
import { APP_COLOR } from '@/src/utils/constants';
import { useTheme } from '@/src/hooks/useTheme';
import ShareDatePicker from '@/src/components/input/share.datepicker';
import ShareBack from '@/src/components/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';
import SharePicker, { PickerItem } from '@/src/components/input/share.picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function SignUpDetail() {
	const { t } = useTranslation('signup-detail');
	const { t: tGender } = useTranslation('gender');
	const router = useRouter();
	const { isDark } = useTheme();
	const params = useLocalSearchParams();

	const name = params.name as string;
	const email = params.email as string;
	const password = params.password as string;
	const otp = params.otp as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const [birthday, setBirthday] = useState('');
	
	// Gender dropdown state
	const [openGender, setOpenGender] = useState(false);
	const [genderItems, setGenderItems] = useState<PickerItem[]>([
		{ label: tGender('other'), value: 'other', icon: <></> },
		{ label: tGender('male'), value: 'male', icon: <MaterialIcons name="male" size={24} color="black" /> },
		{ label: tGender('female'), value: 'female', icon: <MaterialIcons name="female" size={24} color="black" /> },
	]);
	const [gender, setGender] = useState<string | null>(genderItems[0].value); // Set default to first item

	const handleContinue = () => {
		console.log('Signup Detail - Continue:', {
			name,
			email,
			password,
			otp,
			birthday,
			gender,
			isLogin,
			isSignup,
		});

		router.navigate({
			pathname: '/(screens)/(auth)/signup.avatar',
			params: {
				name,
				email,
				password,
				otp,
				birthday,
				gender,
				isLogin: isLogin ? 1 : 0,
				isSignup: isSignup ? 1 : 0,
			},
		});
	};

	const isNextDisabled = !birthday.trim() || !gender;
	const [date, setDate] = useState(new Date());

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
		<SafeAreaView className="flex-1 bg-light-mode dark:bg-dark-mode">
			<ShareBack />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<ScrollView
					className="flex-1 px-5"
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Text className="text-3xl font-bold text-center mb-10 mt-5 text-dark-mode dark:text-light-mode">
						{t('title')}
					</Text>

					{/* Gender Dropdown */}
					<View className="mb-8">
						<SharePicker
							open={openGender}
							value={gender}
							items={genderItems}
							setOpen={setOpenGender}
							setValue={setGender}
							setItems={setGenderItems}
							placeholder={tGender('placeholder')}
							zIndex={2000}
						/>
					</View>

					{/* Birthday Picker */}
					<View className="mb-8" style={{ zIndex: 1 }}>
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
								? APP_COLOR.GRAY_200
								: APP_COLOR.PRIMARY,
						}}
						textStyle={{
							color: isNextDisabled
								? APP_COLOR.DARK_MODE
								: APP_COLOR.LIGHT_MODE,
						}}
					/>

					{/* Add spacing for dropdown to expand */}
					<View style={{ height: 200 }} />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
