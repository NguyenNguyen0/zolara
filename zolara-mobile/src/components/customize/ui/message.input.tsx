import { View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

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
    <View className="flex-row items-center p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-primary-light/20">
      <View className="flex-1 bg-secondary-light dark:bg-primary-light/10 rounded-full px-5 pt-2 pb-3">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="text-dark-mode dark:text-light-mode text-base py-2"
          editable={!disabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
          textAlignVertical="center"
        />
      </View>

      <TouchableOpacity
        className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${disabled || !message.trim() ? "bg-primary/70" : "bg-primary"}`}
        onPress={handleSend}
        disabled={disabled || !message.trim()}
        activeOpacity={0.7}
      >
        <Ionicons
          name="send"
          size={20}
          color={disabled || !message.trim() ? "#afafaf" : "#FFFFFF"}
          className="ml-1"
        />
      </TouchableOpacity>
    </View>
  );
}
