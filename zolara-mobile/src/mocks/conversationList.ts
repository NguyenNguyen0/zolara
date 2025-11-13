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
		name: 'Ai thông minh hơp học sinh lớp 5',
		message: 'Minh: Hello world!',
		time: '10:30',
		avatar: 'https://ava-grp-talk.zadn.vn/8/0/f/0/28/360/c0bfc26e478416e3b5b298dc612d5447.jpg',
		verified: true,
		unread: 3,
		pinned: true,
	},
	{
		id: '2',
		name: 'Shopee',
		message: 'Đơn hàng của bạn đang được giao',
		time: '09:15',
		avatar: 'https://i.pravatar.cc/100?img=2',
		verified: true,
		unread: 1,
	},
	{
		id: '3',
		name: 'Lan Phương',
		message: 'Chiều nay đi cafe nhé!',
		time: 'Yesterday',
		avatar: 'https://i.pravatar.cc/100?img=3',
		verified: false,
		unread: 0,
	}
];