import { Post } from '@/src/components/item/post.item';

/**
 * User profile type
 */
export type UserProfile = {
	name: string;
	bio: string;
	avatar: string;
	coverImage: string;
	verified: boolean;
};

/**
 * Mock user profile data for testing and development
 */
export const MOCK_USER_PROFILE: UserProfile = {
	name: 'Tokuda',
	bio: 'Not bio yet',
	avatar: 'https://i.pravatar.cc/200?img=1',
	coverImage:
		'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
	verified: true,
};

/**
 * Mock user posts data for testing and development
 */
export const MOCK_USER_POSTS: Post[] = [
	{
		id: '1',
		authorName: MOCK_USER_PROFILE.name,
		authorAvatar: MOCK_USER_PROFILE.avatar,
		authorVerified: MOCK_USER_PROFILE.verified,
		createdAt: '2h ago',
		content: 'Beautiful day at the office! 🌟',
		images: [
			'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80',
			'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
		],
		reactions: 245,
		comments: 32,
	},
	{
		id: '2',
		authorName: MOCK_USER_PROFILE.name,
		authorAvatar: MOCK_USER_PROFILE.avatar,
		authorVerified: MOCK_USER_PROFILE.verified,
		createdAt: '5h ago',
		content: 'Working on some exciting new features! 💻✨',
		images: [
			'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
		],
		reactions: 189,
		comments: 28,
	},
	{
		id: '3',
		authorName: MOCK_USER_PROFILE.name,
		authorAvatar: MOCK_USER_PROFILE.avatar,
		authorVerified: MOCK_USER_PROFILE.verified,
		createdAt: '1d ago',
		content: 'Amazing team lunch today! 🍱',
		images: [
			'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
			'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
			'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&q=80',
		],
		reactions: 312,
		comments: 45,
	},
];
