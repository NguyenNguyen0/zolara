import MessageHeader from '@/src/components/ui/message.header';
import MessageTime from '@/src/components/ui/message.time';
import ChatbotMessageItem from '@/src/components/item/chatbot.message.item';
import MessageInput from '@/src/components/ui/message.input';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	View,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { useChatbotStore } from '@/src/store/chatbotStore';
import { useAuthStore } from '@/src/store/authStore';

// Types
interface User {
	id: string;
	name: string;
	avatar?: string;
	isAgent?: boolean;
}

interface Message {
	id: string;
	content: string;
	userId: string;
	timestamp: string; // ISO string for consistency with ChatbotMessageItem
	type?: 'text' | 'image' | 'sticker';
	isStreaming?: boolean;
	error?: string;
}

// Constants
const TIME_GAP = {
	TIMESTAMP_SEPARATOR: 30, // minutes
	AVATAR_SHOW: 5, // minutes
	TIME_SHOW: 5, // minutes
} as const;

// Agent user configuration
const AGENT_USER: User = {
	id: 'agent',
	name: 'Zolara AI',
	avatar: 'https://i.pravatar.cc/150?img=49',
	isAgent: true,
};

export default function Chatbot() {
	const flatListRef = useRef<FlatList>(null);
	
	// Get stores
	const { user } = useAuthStore();
	const currentUserId = user?.userId || 'user';
	
	const {
		messages,
		isConnected,
		isTyping,
		connect,
		disconnect,
		sendMessage,
	} = useChatbotStore();

	// Connect to agent service on mount
	useEffect(() => {
		console.log('Chatbot component mounted, connecting to agent service...');
		connect();

		// Cleanup on unmount
		return () => {
			console.log('Chatbot component unmounting, disconnecting...');
			disconnect();
		};
	}, [connect, disconnect]);

	// Check if timestamp separator should be shown (every 30 minutes)
	const shouldShowTimestamp = (
		currentMsg: Message,
		prevMsg?: Message,
	): boolean => {
		if (!prevMsg) return true;
		const currentTime = new Date(currentMsg.timestamp).getTime();
		const prevTime = new Date(prevMsg.timestamp).getTime();
		const timeDiff = currentTime - prevTime;
		return timeDiff / (1000 * 60) >= TIME_GAP.TIMESTAMP_SEPARATOR;
	};

	// Check if avatar should be shown (different user or time gap)
	const shouldShowAvatar = (
		currentMsg: Message,
		prevMsg?: Message,
	): boolean => {
		if (!prevMsg) return true;
		if (currentMsg.userId !== prevMsg.userId) return true;
		const currentTime = new Date(currentMsg.timestamp).getTime();
		const prevTime = new Date(prevMsg.timestamp).getTime();
		const timeDiff = currentTime - prevTime;
		return timeDiff / (1000 * 60) >= TIME_GAP.AVATAR_SHOW;
	};

	// Check if time should be shown (last message in consecutive group)
	const shouldShowTime = (
		currentMsg: Message,
		nextMsg?: Message,
	): boolean => {
		if (!nextMsg) return true;
		if (currentMsg.userId !== nextMsg.userId) return true;
		const currentTime = new Date(currentMsg.timestamp).getTime();
		const nextTime = new Date(nextMsg.timestamp).getTime();
		const timeDiff = nextTime - currentTime;
		return timeDiff / (1000 * 60) >= TIME_GAP.TIME_SHOW;
	};

	const formatTimestamp = (timestamp: string): string => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	const handleSendMessage = async (message: string) => {
		if (!message.trim() || !isConnected) {
			console.warn('Cannot send message: empty or not connected');
			return;
		}

		try {
			await sendMessage(message.trim());
			// Scroll to bottom after sending
			setTimeout(() => {
				flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
			}, 100);
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	};

	const handleRetry = async (messageId: string) => {
		const message = messages.find(m => m.id === messageId);
		if (message && message.error) {
			// Find the user message that triggered this error
			const messageIndex = messages.findIndex(m => m.id === messageId);
			if (messageIndex > 0) {
				const previousMessage = messages[messageIndex - 1];
				if (previousMessage.userId === currentUserId) {
					await handleSendMessage(previousMessage.content);
				}
			}
		}
	};

	const renderItem = ({ item, index }: { item: Message; index: number }) => {
		// Since we reversed the array for inverted FlatList, we need to reverse the logic
		const reversedMessages = [...messages].reverse();
		const nextMsg = index > 0 ? reversedMessages[index - 1] : undefined;
		const prevMsg =
			index < reversedMessages.length - 1
				? reversedMessages[index + 1]
				: undefined;

		const showTimestamp = shouldShowTimestamp(item, prevMsg);
		const showAvatar = shouldShowAvatar(item, prevMsg);
		const showTime = shouldShowTime(item, nextMsg);

		const isMe = item.userId === currentUserId;
		const user = isMe
			? { id: currentUserId, name: 'You', avatar: undefined }
			: AGENT_USER;

		return (
			<>
				<ChatbotMessageItem
					message={item}
					user={user}
					isMe={isMe}
					isGroup={false}
					showAvatar={showAvatar}
					showTime={showTime}
					onRetry={() => handleRetry(item.id)}
				/>
				{showTimestamp && (
					<MessageTime time={formatTimestamp(item.timestamp)} />
				)}
			</>
		);
	};

	const getHeaderStatus = (): 'stranger' | 'friend' | 'friend_request' | 'chatbot' => {
		return 'chatbot';
	};

	const getOnlineStatus = (): string => {
		if (!isConnected) return 'Offline';
		if (isTyping) return 'Typing...';
		return 'AI Assistant • Online';
	};

	return (
		<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
			{/* AI Chatbot Header */}
			<MessageHeader
				name="Zolara AI Assistant"
				status={getHeaderStatus()}
				onlineStatus={getOnlineStatus()}
				isGroup={false}
				showCallButtons={false}
				onCall={() => console.log('Call pressed')}
				onVideoCall={() => console.log('Video call pressed')}
				onMenu={() => console.log('Menu pressed')}
				onAcceptFriendRequest={() =>
					console.log('Accept friend request')
				}
			/>

			{/* Main Chat Interface */}
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View className="flex-1">
						{/* Messages List */}
						<FlatList
							ref={flatListRef}
							data={[...messages].reverse()}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							className="flex-1 bg-light-mode dark:bg-dark-mode"
							contentContainerStyle={{ 
								paddingVertical: 16,
								paddingHorizontal: 4 
							}}
							inverted
							showsVerticalScrollIndicator={false}
							removeClippedSubviews={true}
							maxToRenderPerBatch={10}
							windowSize={10}
							initialNumToRender={15}
						/>
					</View>
				</TouchableWithoutFeedback>
				
				{/* Message Input */}
				<MessageInput 
					onSend={handleSendMessage}
					disabled={!isConnected}
					placeholder={
						!isConnected 
							? 'Connecting to AI...' 
							: isTyping 
							? 'AI is typing...' 
							: 'Message Zolara AI...'
					}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
