import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
	DateTimePickerAndroid,
	type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';

type ShareDatePickerProps = {
	value: Date;
	onChange: (date: Date) => void;
	placeholder: string;
};

export default function ShareDatePicker({
	value,
	onChange,
	placeholder,
}: ShareDatePickerProps) {
	const { isDark } = useTheme();
	const [iosVisible, setIosVisible] = React.useState(false);

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
		<View>
			<TouchableOpacity
				className="flex-row items-center justify-between px-4 py-4 rounded-xl border"
				style={{
					borderColor: APP_COLOR.GRAY_700,
					backgroundColor: APP_COLOR.LIGHT_MODE,
					height: 50,
				}}
				onPress={() => {
					if (Platform.OS === 'android') {
						DateTimePickerAndroid.open({
							value,
							mode: 'date',
							maximumDate: new Date(),
							onChange: (
								_e: DateTimePickerEvent,
								selectedDate?: Date,
							) => {
								if (selectedDate) onChange(selectedDate);
							},
						});
					} else {
						setIosVisible(true);
					}
				}}
				activeOpacity={0.7}
			>
				<Text
					className="text-base"
					style={{ color: APP_COLOR.DARK_MODE }}
				>
					{value ? formatDate(value) : placeholder}
				</Text>
				<Ionicons
					name="calendar"
					size={20}
					color={APP_COLOR.DARK_MODE}
				/>
			</TouchableOpacity>

			{Platform.OS === 'ios' && iosVisible && (
				<View
					className="absolute left-0 right-0 bottom-0"
					style={{ backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE }}
				>
					<View className="flex-row justify-end px-4 py-2">
						<TouchableOpacity onPress={() => setIosVisible(false)}>
							<Text style={{ color: APP_COLOR.PRIMARY }}>OK</Text>
						</TouchableOpacity>
					</View>
					<DateTimePicker
						value={value}
						mode="date"
						maximumDate={new Date()}
						display="spinner"
						onChange={(
							_e: DateTimePickerEvent,
							selectedDate?: Date,
						) => {
							const d = selectedDate || value;
							onChange(d);
						}}
						themeVariant={isDark ? 'dark' : 'light'}
					/>
				</View>
			)}
		</View>
	);
}


