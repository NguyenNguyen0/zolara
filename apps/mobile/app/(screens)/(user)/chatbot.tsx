import MessageHeader from '@/src/components/ui/message.header';
import MessageTime from '@/src/components/ui/message.time';
import ChatbotMessageItem from '@/src/components/item/chatbot.message.item';
import MessageInput from '@/src/components/ui/message.input';
import TopicSuggestions from '@/src/components/ui/topic.suggestions';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	View,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
	fetchTopics,
	sendMessageWithStream,
	retryFailedMessage,
	selectMessages,
	selectTopics,
	selectIsLoadingTopics,
	selectIsStreaming,
	selectConversationStarted,
	type AgentMessage,
} from '@/src/store/slices/agentSlice';

// Types
interface Message {
	id: string;
	content: string;
	userId: string;
	timestamp: string; // ISO string to match Redux state
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

export default function Chatbot() {
	const { t } = useTranslation('chatbot');
	const dispatch = useAppDispatch();

	// TODO: Get current user ID from Redux
	// const currentUserId = useAppSelector((state) => state.auth.user?.id);
	const currentUserId = '4'; // Temporary mock ID - replace with Redux

	// Agent state
	const messages = useAppSelector(selectMessages);
	const topics = useAppSelector(selectTopics);
	const isLoadingTopics = useAppSelector(selectIsLoadingTopics);
	const isStreaming = useAppSelector(selectIsStreaming);
	const conversationStarted = useAppSelector(selectConversationStarted);

	// Mock conversation data for UI structure
	const conversationInfo = {
		id: '4',
		name: t('title'),
		type: 'CHATBOT' as const,
		members: [
			{
				id: '7',
				name: 'Zolara AI',
				avatar: undefined, // Will use AgentIcon instead
				isAgent: true,
			},
			{
				id: '4',
				name: 'You',
				avatar: 'https://i.pravatar.cc/150?img=60',
				isAgent: false,
			},
		],
	};

	const isGroupConversation = false; // Always false for chatbot

	// Load topics on mount
	useEffect(() => {
		if (!conversationStarted && topics.length === 0) {
			dispatch(fetchTopics({}));
		}
	}, [dispatch, conversationStarted, topics.length]);

	// Handle sending messages
	const handleSendMessage = (message: string) => {
		dispatch(sendMessageWithStream(message));
	};

	// Handle topic selection
	const handleTopicSelect = (topic: string) => {
		handleSendMessage(`${t('topics.prefix')} ${topic}`);
	};

	// Handle retry failed message
	const handleRetryMessage = (messageId: string) => {
		dispatch(retryFailedMessage(messageId));
	};

	// Handle refresh topics
	const handleRefreshTopics = () => {
		dispatch(fetchTopics({}));
	};

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

	const renderItem = ({
		item,
		index,
	}: {
		item: AgentMessage;
		index: number;
	}) => {
		// Since we reversed the array for inverted FlatList, we need to reverse the logic
		const reversedMessages = [...messages].reverse();
		const nextMsg = index > 0 ? reversedMessages[index - 1] : undefined; // Next in display = prev in reversed array
		const prevMsg =
			index < reversedMessages.length - 1
				? reversedMessages[index + 1]
				: undefined; // Prev in display = next in reversed array

		// Convert AgentMessage to Message format with safe defaults
		const message = {
			id: item?.id || `msg-${index}`,
			content: item?.content || '',
			userId: item?.role === 'user' ? currentUserId : '7',
			timestamp: item?.timestamp || new Date().toISOString(),
			isStreaming: item?.isStreaming || false,
			error: item?.error,
		};

		// Skip rendering if item is undefined
		if (!item) {
			return null;
		}

		const showTimestamp = shouldShowTimestamp(
			message,
			prevMsg
				? {
						id: prevMsg.id,
						content: prevMsg.content,
						userId: prevMsg.role === 'user' ? currentUserId : '7',
						timestamp: prevMsg.timestamp,
					}
				: undefined,
		);
		const showAvatar = shouldShowAvatar(
			message,
			prevMsg
				? {
						id: prevMsg.id,
						content: prevMsg.content,
						userId: prevMsg.role === 'user' ? currentUserId : '7',
						timestamp: prevMsg.timestamp,
					}
				: undefined,
		);
		const showTime = shouldShowTime(
			message,
			nextMsg
				? {
						id: nextMsg.id,
						content: nextMsg.content,
						userId: nextMsg.role === 'user' ? currentUserId : '7',
						timestamp: nextMsg.timestamp,
					}
				: undefined,
		);

		const user =
			message.userId === currentUserId
				? conversationInfo.members?.[1] // Current user
				: conversationInfo.members?.[0]; // AI
		const isMe = message.userId === currentUserId;

		// Skip rendering if user is undefined
		if (!user) {
			return null;
		}

		return (
			<>
				<ChatbotMessageItem
					message={message}
					user={user}
					isMe={isMe}
					isGroup={isGroupConversation}
					showAvatar={showAvatar}
					showTime={showTime}
					onRetry={
						item.error
							? () => handleRetryMessage(item.id)
							: undefined
					}
				/>
				{showTimestamp && (
					<MessageTime time={formatTimestamp(message.timestamp)} />
				)}
			</>
		);
	};

	// Map conversation type to header status
	const getHeaderStatus = ():
		| 'stranger'
		| 'friend'
		| 'friend_request'
		| 'chatbot' => {
		return 'chatbot';
	};

	const getOnlineStatus = (): string => {
		return t('status');
	};

	return (
		<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
			<MessageHeader
				name={conversationInfo.name}
				status={getHeaderStatus()}
				onlineStatus={getOnlineStatus()}
				isGroup={isGroupConversation}
				showCallButtons={false}
				onCall={() => console.log('Call pressed')}
				onVideoCall={() => console.log('Video call pressed')}
				onMenu={() => console.log('Menu pressed')}
				onAcceptFriendRequest={() =>
					console.log('Accept friend request')
				}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View className="flex-1">
						{!conversationStarted && (
							<TopicSuggestions
								topics={topics}
								isLoading={isLoadingTopics}
								onTopicSelect={handleTopicSelect}
								onRefresh={handleRefreshTopics}
							/>
						)}
						<FlatList
							data={messages ? [...messages].reverse() : []}
							renderItem={renderItem}
							keyExtractor={(item) =>
								item?.id || `msg-${Math.random()}`
							}
							className="flex-1 bg-light-mode dark:bg-dark-mode"
							contentContainerStyle={{
								paddingVertical: 16,
								flexGrow: (messages?.length || 0) === 0 ? 1 : 0,
							}}
							inverted={(messages?.length || 0) > 0}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</TouchableWithoutFeedback>
				<MessageInput
					onSendMessage={handleSendMessage}
					isDisabled={isStreaming}
					isLoading={isStreaming}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
