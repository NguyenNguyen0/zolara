import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function MessageInput() {
	const [message, setMessage] = useState('');

	return (
		<View className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
			<View className="flex-1 bg-secondary-light dark:bg-secondary-dark rounded-full px-4 py-1">
				<TextInput
					value={message}
					onChangeText={setMessage}
					placeholder="Message"
					placeholderTextColor="#9CA3AF"
					className="text-dark-mode dark:text-light-mode"
				/>
			</View>

			<TouchableOpacity className="ml-2">
				<Text className="text-2xl text-secondary-dark dark:text-secondary-light">Gửi</Text>
			</TouchableOpacity>
		</View>
	);
}
