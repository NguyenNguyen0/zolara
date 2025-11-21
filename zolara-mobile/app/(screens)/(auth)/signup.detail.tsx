import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ShareButton from '@/components/customize/button/share.button';
import { APP_COLOR } from '@/utils/constants';
import ShareDatePicker from '@/components/customize/input/share.datepicker';
import ShareBack from '@/components/customize/button/share.back';
import { SafeAreaView } from 'react-native-safe-area-context';
import SharePicker, { PickerItem } from '@/components/customize/input/share.picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export default function SignUpDetail() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { completeRegistration } = useAuthStore();

	const name = params.name as string;
	const email = params.email as string;
	const password = params.password as string;
	const isLogin = params.isLogin === '1';
	const isSignup = params.isSignup === '1';

	const [dateOfBirth, setDateOfBirth] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	
	// Gender dropdown state
	const [openGender, setOpenGender] = useState(false);
	const [genderItems, setGenderItems] = useState<PickerItem[]>([
		{ label: 'Khác', value: 'OTHER', icon: <></> },
		{ label: 'Nam', value: 'MALE', icon: <MaterialIcons name="male" size={24} color="black" /> },
		{ label: 'Nữ', value: 'FEMALE', icon: <MaterialIcons name="female" size={24} color="black" /> },
	]);
	const [gender, setGender] = useState<string | null>('MALE'); // Set default to MALE

	// Tự động chọn item đầu tiên (Nam - MALE)
	useEffect(() => {
		if (!gender) {
			setGender('MALE');
		}
	}, []);

	const handleContinue = async () => {
		if (!dateOfBirth || !gender) {
			Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
			return;
		}

		if (!password || !name) {
			Alert.alert('Lỗi', 'Thiếu thông tin cần thiết');
			return;
		}

		setIsLoading(true);
		try {
			await completeRegistration({
				password: password as string,
				fullName: name as string,
				dateOfBirth,
				gender,
			});
			Alert.alert('Thành công', 'Đăng ký thành công', [
				{
					text: 'Đăng nhập',
					onPress: () => router.replace('/(screens)/(auth)/login.email' as any),
				},
			]);
		} catch (error: any) {
			// Handle error message - convert array to string if needed
			let errorMessage = 'Đã có lỗi xảy ra';
			if (error?.response?.data?.message) {
				const message = error.response.data.message;
				if (Array.isArray(message)) {
					errorMessage = message.join(', ');
				} else if (typeof message === 'string') {
					errorMessage = message;
				}
			} else if (error?.message) {
				errorMessage = error.message;
			}
			Alert.alert('Lỗi', errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const isNextDisabled = !dateOfBirth.trim() || !gender;
	const [date, setDate] = useState(new Date());

	const formatDate = (d: Date) => {
		try {
			// Format to ISO date string (YYYY-MM-DD) for API
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		} catch {
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
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
					<Text className="text-3xl font-bold text-center mb-10 mt-5 text-gray-900">
						THÊM THÔNG TIN CÁ NHÂN
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
							placeholder="Giới tính"
							zIndex={2000}
						/>
					</View>

					{/* Birthday Picker */}
					<View className="mb-8" style={{ zIndex: 1 }}>
						<ShareDatePicker
							value={date}
							onChange={(d) => {
								setDate(d);
								setDateOfBirth(formatDate(d));
							}}
							placeholder="Ngày sinh"
						/>
					</View>

					<ShareButton
						title="Tiếp tục"
						onPress={handleContinue}
						disabled={isNextDisabled || isLoading}
						buttonStyle={{
							backgroundColor: isNextDisabled || isLoading
								? APP_COLOR.GRAY_200
								: APP_COLOR.PRIMARY,
						}}
						textStyle={{
							color: isNextDisabled || isLoading
								? APP_COLOR.DARK_MODE
								: APP_COLOR.LIGHT_MODE,
						}}
						isLoading={isLoading}
					/>

					{/* Add spacing for dropdown to expand */}
					<View style={{ height: 200 }} />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
