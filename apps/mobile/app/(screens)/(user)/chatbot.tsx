import MessageHeader from '@/src/components/ui/message.header';
import MessageTime from '@/src/components/ui/message.time';
import MessageItem from '@/src/components/item/message.item';
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
import { useState } from 'react';
import {
	MOCK_CHATBOT_CHAT,
} from '@/src/mocks/conversation';

// Types
interface User {
	id: string;
	name: string;
	avatar?: string;
}

interface Message {
	id: string;
	content: string;
	userId: string;
	timestamp: Date;
	type?: 'text' | 'image' | 'sticker';
}

type ConversationType = 'GROUP' | 'FRIEND' | 'STRANGER' | 'CHATBOT';

interface Conversation {
	id: string;
	name: string;
	type: ConversationType;
	members: User[];
	messages: Message[];
}

// Constants
const TIME_GAP = {
	TIMESTAMP_SEPARATOR: 30, // minutes
	AVATAR_SHOW: 5, // minutes
	TIME_SHOW: 5, // minutes
} as const;

export default function Chatbot() {
	// TODO: Get current user ID from Redux
	// const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
	const currentUserId = '4'; // Temporary mock ID - replace with Redux

	const [conversation] = useState<Conversation>(MOCK_CHATBOT_CHAT);

	const isGroupConversation = conversation.type === 'GROUP';

	// Check if timestamp separator should be shown (every 30 minutes)
	const shouldShowTimestamp = (
		currentMsg: Message,
		prevMsg?: Message,
	): boolean => {
		if (!prevMsg) return true;
		const timeDiff =
			currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime();
		return timeDiff / (1000 * 60) >= TIME_GAP.TIMESTAMP_SEPARATOR;
	};

	// Check if avatar should be shown (different user or time gap)
	const shouldShowAvatar = (
		currentMsg: Message,
		prevMsg?: Message,
	): boolean => {
		if (!prevMsg) return true;
		if (currentMsg.userId !== prevMsg.userId) return true;
		const timeDiff =
			currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime();
		return timeDiff / (1000 * 60) >= TIME_GAP.AVATAR_SHOW;
	};

	// Check if time should be shown (last message in consecutive group)
	const shouldShowTime = (
		currentMsg: Message,
		nextMsg?: Message,
	): boolean => {
		if (!nextMsg) return true;
		if (currentMsg.userId !== nextMsg.userId) return true;
		const timeDiff =
			nextMsg.timestamp.getTime() - currentMsg.timestamp.getTime();
		return timeDiff / (1000 * 60) >= TIME_GAP.TIME_SHOW;
	};

	const formatTimestamp = (date: Date): string => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	const renderItem = ({ item, index }: { item: Message; index: number }) => {
		// Since we reversed the array for inverted FlatList, we need to reverse the logic
		const reversedMessages = [...conversation.messages].reverse();
		const nextMsg = index > 0 ? reversedMessages[index - 1] : undefined; // Next in display = prev in reversed array
		const prevMsg =
			index < reversedMessages.length - 1
				? reversedMessages[index + 1]
				: undefined; // Prev in display = next in reversed array

		const showTimestamp = shouldShowTimestamp(item, prevMsg);
		const showAvatar = shouldShowAvatar(item, prevMsg);
		const showTime = shouldShowTime(item, nextMsg);

		const user =
			conversation.members.find((m) => m.id === item.userId) ||
			conversation.members[0];
		const isMe = item.userId === currentUserId;

		return (
			<>
				<MessageItem
					message={item}
					user={user}
					isMe={isMe}
					isGroup={isGroupConversation}
					showAvatar={showAvatar}
					showTime={showTime}
				/>
				{showTimestamp && (
					<MessageTime time={formatTimestamp(item.timestamp)} />
				)}
			</>
		);
	};

	// Map conversation type to header status
	const getHeaderStatus = (): 'stranger' | 'friend' | 'friend_request' | 'chatbot' => {
		switch (conversation.type) {
			case 'GROUP':
			case 'FRIEND':
				return 'friend';
			case 'STRANGER':
				return 'friend_request';
			case 'CHATBOT':
				return 'chatbot';
			default:
				return 'stranger';
		}
	};

	const getOnlineStatus = (): string => {
		if (conversation.type === 'GROUP') {
			return `${conversation.members.length} members`;
		}
		if (conversation.type === 'FRIEND') {
			return 'Online Just Now';
		}
		if (conversation.type === 'CHATBOT') {
			return 'AI Assistant';
		}
		return '';
	};

	return (
		<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
		<MessageHeader
			name={conversation.name}
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
						<FlatList
							data={[...conversation.messages].reverse()}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							className="flex-1 bg-light-mode dark:bg-dark-mode"
							contentContainerStyle={{ paddingVertical: 16 }}
							inverted
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</TouchableWithoutFeedback>
				<MessageInput />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
