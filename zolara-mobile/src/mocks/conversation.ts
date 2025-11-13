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

export const MOCK_GROUP_CHAT: Conversation = {
	id: '1',
	name: 'Ai Thông Minh Hơn Học Sinh Lớp 5',
	type: 'GROUP',
	members: [
		{
			id: '1',
			name: 'Gia Sư IUH',
			avatar: 'https://i.pravatar.cc/150?img=33',
		},
		{
			id: '2',
			name: 'Đào Quốc Tuấn',
			avatar: 'https://i.pravatar.cc/150?img=12',
		},
		{
			id: '3',
			name: 'Nguyễn Văn Minh',
			avatar: 'https://i.pravatar.cc/150?img=68',
		},
		{
			id: '4',
			name: 'You',
			avatar: 'https://i.pravatar.cc/150?img=60',
		},
	],
	messages: [
		{
			id: '1',
			content: 'juan',
			userId: '1',
			timestamp: new Date('2025-10-21T19:45:00'),
		},
		{
			id: '2',
			content: 'check chưa',
			userId: '1',
			timestamp: new Date('2025-10-21T19:47:00'),
		},
		{
			id: '3',
			content: 'vô bth',
			userId: '2',
			timestamp: new Date('2025-10-21T19:47:00'),
		},
		{
			id: '4',
			content:
				'thử 1 tiếng thử @Nguyen Van Minhhhhhhhhhhhhhhhhhhhhhhhhhhheeeeeeeeeeeeeeeeeeeeeeee',
			userId: '1',
			timestamp: new Date('2025-10-21T19:47:00'),
		},
		{
			id: '5',
			content: 't thấy find game bth',
			userId: '2',
			timestamp: new Date('2025-10-21T19:52:00'),
		},
		{
			id: '6',
			content: 'ổn',
			userId: '4',
			timestamp: new Date('2025-10-21T19:54:00'),
		},
		{
			id: '7',
			content: 'thế bữa đó game bug à',
			userId: '4',
			timestamp: new Date('2025-10-21T19:54:00'),
		},
		{
			id: '8',
			content: 'ăn cơm xfuuu làm trận trc',
			userId: '4',
			timestamp: new Date('2025-10-21T19:54:00'),
		},
	],
};

export const MOCK_FRIEND_CHAT: Conversation = {
	id: '2',
	name: 'Nguyễn Văn Minh',
	type: 'FRIEND',
	members: [
		{
			id: '5',
			name: 'Nguyễn Văn Minh',
			avatar: 'https://avatars.githubusercontent.com/u/121565657?v=4',
		},
		{
			id: '4',
			name: 'You',
			avatar: 'https://i.pravatar.cc/150?img=60',
		},
	],
	messages: [
		{
			id: '1',
			content: 'Hello, how are you?',
			userId: '5',
			timestamp: new Date('2025-10-21T22:45:00'),
		},
		{
			id: '2',
			content: "I'm good, thanks! How about you?",
			userId: '4',
			timestamp: new Date('2025-10-21T22:46:00'),
		},
		{
			id: '3',
			content: 'Doing great! Working on the project.',
			userId: '5',
			timestamp: new Date('2025-10-21T22:47:00'),
		},
	],
};

export const MOCK_STRANGER_CHAT: Conversation = {
	id: '3',
	name: 'Nguyễn A Nguyên',
	type: 'STRANGER',
	members: [
		{
			id: '6',
			name: 'Nguyễn Duy Khải',
			avatar: 'https://i.pravatar.cc/150?img=8',
		},
		{
			id: '4',
			name: 'You',
			avatar: 'https://i.pravatar.cc/150?img=60',
		},
	],
	messages: [
		{
			id: '1',
			content:
				'alo ông coi chia phần cho tui với nha, với lại tui chưa biết nhiều cái như máy ông có gì ông chỉ túi với nha',
			userId: '6',
			timestamp: new Date('2025-12-10T17:47:00'),
		},
		{
			id: '2',
			content:
				'Nhóm này giúp đỡ nhau làm\nThoải mái thui à\nLàm ưu nhìn thoi là dc à\nBackend 2 ô kia gánh hết quá đã rùi',
			userId: '4',
			timestamp: new Date('2025-12-10T17:52:00'),
		},
		{
			id: '3',
			content:
				'kkk tại tui chưa tìm hiểu được nhiều cái nên hơi ngại sợ k làm tổi nói á',
			userId: '6',
			timestamp: new Date('2025-12-10T17:53:00'),
		},
		{
			id: '4',
			content: 'Thôi mãi thôi\nK có gì đâuuu',
			userId: '4',
			timestamp: new Date('2025-12-10T17:54:00'),
		},
		{
			id: '5',
			content: 'H code AI ko mà k ai code chay',
			userId: '4',
			timestamp: new Date('2025-12-10T17:55:00'),
		},
		{
			id: '6',
			content: 'Hiểu luông là oki rùi',
			userId: '4',
			timestamp: new Date('2025-12-10T17:56:00'),
		},
	],
};

export const MOCK_CHATBOT_CHAT: Conversation = {
	id: '4',
	name: 'Zolara AI Assistant',
	type: 'CHATBOT',
	members: [
		{
			id: '7',
			name: 'Zolara AI',
			avatar: 'https://i.pravatar.cc/150?img=49',
		},
		{
			id: '4',
			name: 'You',
			avatar: 'https://i.pravatar.cc/150?img=60',
		},
	],
	messages: [
		{
			id: '1',
			content: 'Xin chào! Tôi là Zolara AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?',
			userId: '7',
			timestamp: new Date('2025-10-24T08:00:00'),
		},
		{
			id: '2',
			content: 'Chào bạn! Bạn có thể giúp tôi tìm hiểu về React Native không?',
			userId: '4',
			timestamp: new Date('2025-10-24T08:01:00'),
		},
		{
			id: '3',
			content: 'Tất nhiên! React Native là một framework được phát triển bởi Facebook để xây dựng ứng dụng di động đa nền tảng bằng JavaScript và React. Bạn muốn tìm hiểu về khía cạnh nào cụ thể?',
			userId: '7',
			timestamp: new Date('2025-10-24T08:01:30'),
		},
		{
			id: '4',
			content: 'Làm sao để tạo một component đơn giản?',
			userId: '4',
			timestamp: new Date('2025-10-24T08:02:00'),
		},
		{
			id: '5',
			content: 'Để tạo một component đơn giản trong React Native, bạn có thể sử dụng functional component như sau:\n\nconst MyComponent = () => {\n  return (\n    <View>\n      <Text>Hello World!</Text>\n    </View>\n  );\n};\n\nBạn cần import View và Text từ react-native nhé!',
			userId: '7',
			timestamp: new Date('2025-10-24T08:02:30'),
		},
		{
			id: '6',
			content: 'Cảm ơn bạn! Rất hữu ích đấy!',
			userId: '4',
			timestamp: new Date('2025-10-24T08:03:00'),
		},
		{
			id: '7',
			content: 'Rất vui được giúp đỡ bạn! Nếu có bất kỳ câu hỏi nào khác về React Native hoặc lập trình, đừng ngại hỏi tôi nhé! 😊',
			userId: '7',
			timestamp: new Date('2025-10-24T08:03:15'),
		},
	],
};
