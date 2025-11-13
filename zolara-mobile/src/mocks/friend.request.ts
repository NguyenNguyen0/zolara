export type FriendRequest = {
	id: string;
	userId: string;
	name: string;
	avatar: string;
	verified?: boolean;
	timestamp: Date;
};

export const MOCK_FRIEND_REQUESTS_RECEIVED: FriendRequest[] = [
	{
		id: '1',
		userId: 'user_001',
		name: 'Nguyễn A Duy',
		avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		verified: true,
		timestamp: new Date('2025-10-15'),
	},
	{
		id: '2',
		userId: 'user_002',
		name: 'Pizza Gà Rán',
		avatar: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		verified: false,
		timestamp: new Date('2025-09-07'),
	},
	{
		id: '3',
		userId: 'user_003',
		name: 'Hải Yến Gmo Tenten Zcom',
		avatar: '',
		verified: true,
		timestamp: new Date('2025-08-20'),
	},
];

export const MOCK_FRIEND_REQUESTS_SENT: FriendRequest[] = [
	{
		id: '4',
		userId: 'user_004',
		name: 'Onichan',
		avatar: '',
		verified: false,
		timestamp: new Date('2025-10-23'),
	},
	{
		id: '5',
		userId: 'user_005',
		name: 'Toàn Nguyễn',
		avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		verified: true,
		timestamp: new Date('2025-10-20'),
	},
];

