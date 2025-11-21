import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
	DateTimePickerAndroid,
	type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { APP_COLOR } from '@/utils/constants';

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
				className="flex-row items-center justify-between px-4 py-4 rounded-xl border bg-white h-[50px] border-gray-700"
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
					className="text-base text-gray-900"
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
					className="absolute left-0 right-0 bottom-0 bg-white"
				>
					<View className="flex-row justify-end px-4 py-2">
						<TouchableOpacity onPress={() => setIosVisible(false)}>
							<Text className="text-blue-500">OK</Text>
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
						themeVariant="light"
					/>
				</View>
			)}
		</View>
	);
}


