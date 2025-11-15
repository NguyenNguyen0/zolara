import { NotificationItemProps } from '@/src/components/item/notification.item';

/**
 * Mock notification data for testing and development
 */
export const MOCK_NOTIFICATIONS: NotificationItemProps[] = [
	{
		id: '1',
		type: 'add_friend',
		actor: {
			name: 'Toska Nguyễn',
			avatar: 'https://i.pravatar.cc/150?img=1',
			verified: true,
		},
		content: 'sent you a friend request',
		timestamp: '4w',
		isRead: false,
	},
	{
		id: '2',
		type: 'add_friend',
		actor: {
			name: 'Nguyen Huyy',
			avatar: 'https://i.pravatar.cc/150?img=2',
			verified: true,
		},
		content: 'sent you a friend request',
		timestamp: '4w',
		isRead: false,
	},
	{
		id: '3',
		type: 'comment',
		actor: {
			name: 'Hội những người yêu kem Celano',
			avatar: 'https://i.pravatar.cc/150?img=3',
			verified: false,
		},
		content:
			'commented on HIEUTHUHAI\'s post: "Chắc phải tổ chức cuộc so trình mix"',
		timestamp: '42m',
		isRead: false,
	},
	{
		id: '4',
		type: 'mention',
		actor: {
			name: 'Yasuo',
			avatar: 'https://i.pravatar.cc/150?img=4',
			verified: false,
		},
		content: 'mentioned you in a comment: "Nguyen Minh mới thấy chị phiên mà"',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '5',
		type: 'post',
		actor: {
			name: 'Code MeLy',
			avatar: 'https://i.pravatar.cc/150?img=5',
			verified: false,
		},
		content:
			'posted a new reel: "Team IT của Meta có dạng ổn không khi tính năng bị bug đúng lúc sếp đang demo t..."',
		timestamp: '3w',
		isRead: true,
	},
	{
		id: '6',
		type: 'mention',
		actor: {
			name: 'Long Nguyen',
			avatar: 'https://i.pravatar.cc/150?img=6',
			verified: true,
		},
		content: 'mentioned you in a comment',
		timestamp: '1w',
		isRead: true,
	},
	{
		id: '7',
		type: 'login',
		content: 'New login detected from Windows PC in Ho Chi Minh City',
		timestamp: '5d',
		isRead: true,
	},
	{
		id: '8',
		type: 'post',
		actor: {
			name: 'Theanh28 Entertainment',
			avatar: 'https://i.pravatar.cc/150?img=7',
			verified: false,
		},
		content: 'posted 2 new reels, including "Giọt bia giải sầu cuối đời cù..."',
		timestamp: '3d',
		isRead: true,
	},
];
