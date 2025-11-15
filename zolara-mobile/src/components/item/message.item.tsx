import { View, Text } from 'react-native';
import Avatar from '@/src/components/ui/avatar';
import { formatMessageTime } from '@/src/utils/convertHelper';

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

interface MessageItemProps {
	message: Message;
	user: User;
	isMe: boolean;
	isGroup: boolean;
	showAvatar: boolean;
	showTime: boolean;
}

export default function MessageItem({
	message,
	user,
	isMe,
	isGroup,
	showAvatar,
	showTime,
}: MessageItemProps) {
	const time = formatMessageTime(message.timestamp);

	const bubbleStyle = isMe
		? 'bg-light-mode dark:bg-secondary-dark rounded-2xl rounded-tr-md'
		: 'bg-light-mode dark:bg-secondary-dark rounded-2xl rounded-tl-md';

	const shadowStyle = {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 4,
	};

	return (
		<View
			className={`flex-row mb-1 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}
		>
			{/* Avatar */}
			{!isMe && (
				<View className="w-10 mr-5 mt-1">
					{showAvatar ? (
						<Avatar uri={user.avatar} />
					) : (
						<View className="w-10 h-10" />
					)}
				</View>
			)}

			<View
				className={`flex-shrink max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}
			>
				{/* Message bubble */}
				<View className={`px-3 py-2 ${bubbleStyle}`} style={shadowStyle}>
					{/* Tên người gửi */}
					{!isMe && isGroup && showAvatar && (
						<Text className="text-xs mb-1 font-medium text-[#FF6B6B]">
							{user.name}
						</Text>
					)}

					{/* Nội dung tin nhắn */}
					<Text className="text-[15px] leading-5 text-dark-mode dark:text-light-mode">
						{message.content}
					</Text>

					{/* Thời gian */}
					{showTime && (
						<Text
							className="text-[10px] text-gray-500 dark:text-secondary-light mt-1"
							style={{
								alignSelf: isMe ? 'flex-end' : 'flex-start',
							}}
						>
							{time}
						</Text>
					)}
				</View>
			</View>
		</View>
	);
}
