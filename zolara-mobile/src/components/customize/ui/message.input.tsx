import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function MessageInput() {
	const [message, setMessage] = useState('');

	return (
		<View className="flex-row items-center p-4 bg-white border-t border-gray-200">
			<View className="flex-1 bg-gray-100 rounded-full px-4 py-1">
				<TextInput
					value={message}
					onChangeText={setMessage}
					placeholder="Nhập tin nhắn..."
					placeholderTextColor="#9CA3AF"
					className="text-gray-900"
				/>
			</View>

			<TouchableOpacity className="ml-2">
				<Text className="text-2xl text-gray-900">Gửi</Text>
			</TouchableOpacity>
		</View>
	);
}
