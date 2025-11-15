import { Post } from '@/src/components/item/post.item';

/**
 * Mock post data for testing and development
 */
export const MOCK_POSTS: Post[] = [
	{
		id: '1',
		authorName: 'Md Ismail Sojal',
		authorAvatar:
			'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=96&q=80&auto=format&fit=crop&crop=faces',
		authorVerified: true,
		createdAt: '1d',
		content: 'Bro disappeared like it never existed.',
		images: [],
		reactions: 3200,
		comments: 181,
	},
	{
		id: '2',
		authorName: 'Alex',
		authorAvatar:
			'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=96&q=80&auto=format&fit=crop&crop=faces',
		authorVerified: true,
		createdAt: '2d',
		content: 'Weekend hike photos!',
		images: [
			'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&auto=format&fit=crop&q=80',
			'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop&q=80',
			'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop&q=80',
			'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop&q=80',
			'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop&q=80',
			'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop&q=80',
		],
		reactions: 124,
		comments: 36,
	},
];
