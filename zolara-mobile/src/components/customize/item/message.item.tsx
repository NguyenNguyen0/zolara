import { View, Text } from 'react-native';
import Avatar from '@/components/customize/ui/avatar';
import { formatMessageTime } from '@/utils/convertHelper';

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
		? 'bg-gray-100 rounded-2xl rounded-tr-md'
		: 'bg-gray-100 rounded-2xl rounded-tl-md';

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
					<Text className="text-[15px] leading-5 text-gray-900">
						{message.content}
					</Text>

					{/* Thời gian */}
					{showTime && (
						<Text
							className="text-[10px] text-gray-500 mt-1"
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
