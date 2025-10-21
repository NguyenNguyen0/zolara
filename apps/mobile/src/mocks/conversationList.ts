/**
 * Conversation list item type
 */
export type ConversationListItem = {
	id: string;
	name: string;
	message: string;
	time: string;
	avatar: string;
	verified: boolean;
	unread: number;
	pinned?: boolean;
	muted?: boolean;
};

/**
 * Mock conversation list data for testing and development
 */
export const MOCK_CONVERSATION_LIST: ConversationListItem[] = [
	{
		id: '1',
		name: 'My Cloud',
		message: 'You: [Link] PTUD_2024_Nhom02_DHKT...',
		time: '28/08',
		avatar: 'https://i.pravatar.cc/100?img=1',
		verified: true,
		unread: 1,
	},
	{
		id: '2',
		name: 'Media Box',
		message: 'Zalo Video: Bắc Ninh trở thành tâm...',
		time: '7 hours',
		avatar: 'https://i.pravatar.cc/100?img=2',
		verified: false,
		unread: 1,
	},
	{
		id: '3',
		name: 'Toàn Nguyễn',
		message: 'okok',
		time: '7 hours',
		avatar: 'https://i.pravatar.cc/100?img=3',
		verified: false,
		unread: 0,
	},
	{
		id: '4',
		name: 'Zalopay',
		message: '(+1) deal nạp game -50% tặng bạn nè',
		time: '8 hours',
		avatar: 'https://i.pravatar.cc/100?img=4',
		verified: true,
		unread: 0,
	},
	{
		id: '5',
		name: 'Zalo',
		message: 'Cập nhật mới nhất từ Zalo',
		time: '19 hours',
		avatar: 'https://i.pravatar.cc/100?img=5',
		verified: true,
		unread: 0,
	},
	{
		id: '6',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '7',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '8',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '9',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '10',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '11',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '12',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		pinned: false,
		muted: false,
		unread: 0,
	},
];
