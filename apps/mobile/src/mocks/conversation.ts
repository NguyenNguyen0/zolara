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

type ConversationType = 'GROUP' | 'FRIEND' | 'STRANGER';

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
	name: 'Nguyễn A Minh',
	type: 'FRIEND',
	members: [
		{
			id: '5',
			name: 'Nguyễn A Minh',
			avatar: 'https://i.pravatar.cc/150?img=15',
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
