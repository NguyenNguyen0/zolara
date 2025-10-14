import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, View } from 'react-native';
import Composer from '@/src/components/item/composer';
import PostItemComponent, { Post } from '@/src/components/item/post.item';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import Header from '@/src/components/commons/header';

// no local fallback needed here; avatars handled inside components

const INITIAL_POSTS: Post[] = [
	{
		id: '1',
		authorName: 'Md Ismail Sojal',
		authorAvatar: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=96&q=80&auto=format&fit=crop&crop=faces',
		createdAt: '1d',
		content: 'Bro disappeared like it never existed.',
		images: [],
        reactions: 3200,
        comments: 181,
	},
	{
		id: '2',
		authorName: 'Alex',
		authorAvatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=96&q=80&auto=format&fit=crop&crop=faces',
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

// item components moved to src/components/item

// Main Component
export default function Newsfeed() {
	const { t } = useTranslation('newsfeed');
	const { isDark } = useTheme();
	const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

	const handleCreate = (text?: string, images?: string[]) => {
		const newPost: Post = {
			id: Date.now().toString(),
			authorName: 'You',
			authorAvatar: INITIAL_POSTS[0].authorAvatar,
			createdAt: 'Just now',
			content: text,
			images,
			reactions: 0,
			comments: 0,
		};
		setPosts((prev) => [newPost, ...prev]);
	};

	return (
		<SafeAreaView edges={['top']} className="flex-1 bg-light-mode dark:bg-dark-mode">
			<Header showSearch showAddPost />
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <PostItemComponent item={item} />}
				ListHeaderComponent={<Composer onCreate={handleCreate} currentUserAvatar={INITIAL_POSTS[0].authorAvatar} />}
				ListEmptyComponent={
					<View className="px-4 py-8">
						<Text className="text-center text-gray-500 dark:text-gray-400">
							{t('empty')}
						</Text>
					</View>
				}
				contentContainerStyle={{ paddingBottom: 24 }}
				style={{
					backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
				}}
			/>
		</SafeAreaView>
	);
}