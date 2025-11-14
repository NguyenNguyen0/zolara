import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
	onSendMessage?: (message: string) => void;
	isDisabled?: boolean;
	isLoading?: boolean;
}

export default function MessageInput({
	onSendMessage,
	isDisabled = false,
	isLoading = false
}: MessageInputProps) {
	const { t } = useTranslation('chatbot');
	const [message, setMessage] = useState('');

	const handleSend = () => {
		if (message.trim() && !isDisabled && !isLoading) {
			onSendMessage?.(message.trim());
			setMessage('');
		}
	};

	return (
		<View className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
			<View className="flex-1 bg-secondary-light dark:bg-secondary-dark rounded-2xl px-4 pt-1 pb-2 min-h-[50px] max-h-[120px] justify-center">
				<TextInput
					value={message}
					onChangeText={setMessage}
					placeholder={
						isDisabled
							? t('messages.loading')
							: t('messages.placeholder')
					}
					placeholderTextColor="#9CA3AF"
					className="text-dark-mode dark:text-light-mode text-base leading-6 min-h-[24px] py-2"
					editable={!isDisabled && !isLoading}
					onSubmitEditing={handleSend}
					returnKeyType="send"
					multiline
					textAlignVertical="center"
				/>
			</View>

			<TouchableOpacity
				className={`ml-3 p-3 rounded-full items-center justify-center ${isDisabled || isLoading || !message.trim() ? 'opacity-50 bg-gray-300 dark:bg-gray-600' : 'bg-purple-500 dark:bg-purple-600'}`}
				onPress={handleSend}
				disabled={isDisabled || isLoading || !message.trim()}
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#FFFFFF" />
				) : (
					<Ionicons name="send" size={20} color="#FFFFFF" />
				)}
			</TouchableOpacity>
		</View>
	);
}
