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
	},
	{
		id: '4',
		name: 'Grab',
		message: 'Mã giảm 50% cho chuyến đi tiếp theo',
		time: 'Yesterday',
		avatar: 'https://i.pravatar.cc/100?img=4',
		verified: true,
		unread: 0,
	},
	{
		id: '5',
		name: 'Team Dự Án ABC',
		message: 'Huy: Meeting lúc 2pm ngày mai nhé',
		time: 'Monday',
		avatar: 'https://i.pravatar.cc/100?img=5',
		verified: false,
		unread: 5,
		pinned: true,
	},
	{
		id: '6',
		name: 'Mẹ',
		message: 'Con ăn cơm chưa?',
		time: 'Monday',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '7',
		name: 'Netflix',
		message: 'Phim mới đang hot: The Last Dance',
		time: 'Sunday',
		avatar: 'https://i.pravatar.cc/100?img=7',
		verified: true,
		unread: 0,
		muted: true,
	},
	{
		id: '8',
		name: 'Hoàng Tuấn',
		message: 'You: Ok, mai mình gặp nhé',
		time: 'Sunday',
		avatar: 'https://i.pravatar.cc/100?img=8',
		verified: false,
		unread: 0,
	},
	{
		id: '9',
		name: 'Ngân Hàng MB',
		message: 'TK của bạn vừa được cộng 5,000,000đ',
		time: 'Saturday',
		avatar: 'https://i.pravatar.cc/100?img=9',
		verified: true,
		unread: 0,
	},
	{
		id: '10',
		name: 'CLB Bóng Đá',
		message: '[Photo] Lịch thi đấu tuần này',
		time: 'Friday',
		avatar: 'https://i.pravatar.cc/100?img=10',
		verified: false,
		unread: 2,
	},
	{
		id: '11',
		name: 'Thu Hà',
		message: '[Voice] 0:45',
		time: 'Friday',
		avatar: 'https://i.pravatar.cc/100?img=11',
		verified: false,
		unread: 0,
	},
	{
		id: '12',
		name: 'Nhóm Gia Đình',
		message: 'Ba: Cuối tuần về nhà ăn cơm nhé',
		time: 'Thursday',
		avatar: 'https://i.pravatar.cc/100?img=12',
		verified: false,
		pinned: false,
		muted: false,
		unread: 0,
	},
];