import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface MessageInputProps {
	onSend?: (message: string) => void | Promise<void>;
	disabled?: boolean;
	placeholder?: string;
}

export default function MessageInput({ 
	onSend, 
	disabled = false,
	placeholder = 'Message'
}: MessageInputProps) {
	const [message, setMessage] = useState('');

	const handleSend = async () => {
		if (!message.trim() || disabled) return;
		
		const messageToSend = message.trim();
		setMessage(''); // Clear input immediately
		
		if (onSend) {
			await onSend(messageToSend);
		}
	};

	return (
		<View className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
			<View className="flex-1 bg-secondary-light dark:bg-secondary-dark rounded-full px-4 py-1">
				<TextInput
					value={message}
					onChangeText={setMessage}
					placeholder={placeholder}
					placeholderTextColor="#9CA3AF"
					className="text-dark-mode dark:text-light-mode"
					editable={!disabled}
					onSubmitEditing={handleSend}
					returnKeyType="send"
				/>
			</View>

			<TouchableOpacity 
				className="ml-2"
				onPress={handleSend}
				disabled={disabled || !message.trim()}
			>
				<Text className={`text-2xl ${disabled || !message.trim() ? 'text-gray-400' : 'text-secondary-dark dark:text-secondary-light'}`}>
					Gửi
				</Text>
			</TouchableOpacity>
		</View>
	);
}
