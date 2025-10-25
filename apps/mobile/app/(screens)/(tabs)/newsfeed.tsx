import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, View, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import NewsFeedComposer from '@/src/components/ui/newsfeed.composer';
import PostItemComponent, { Post } from '@/src/components/item/post.item';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import NavigateHeader from '@/src/components/commons/navigate.header';
import { MOCK_POSTS } from '@/src/mocks/post';

// Main Component
export default function NewsfeedTab() {
	const { t } = useTranslation('newsfeed');
	const { isDark } = useTheme();
	const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
	const [refreshing, setRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const handleLoadMore = () => {
		if (!isLoadingMore) {
			setIsLoadingMore(true);
			// Simulate API call to load more posts
			setTimeout(() => {
				setIsLoadingMore(false);
			}, 2000);
		}
	};

	const handleCreate = (text?: string, images?: string[]) => {
		const newPost: Post = {
			id: Date.now().toString(),
			authorName: t('you'),
			authorAvatar: MOCK_POSTS[0].authorAvatar,
			authorVerified: false,
			createdAt: t('justNow'),
			content: text,
			images,
			reactions: 0,
			comments: 0,
		};
		setPosts((prev) => [newPost, ...prev]);
	};

	const renderFooter = () => {
		if (!isLoadingMore) return null;
		return (
			<View className="py-4 items-center justify-center">
				<ActivityIndicator
					size="small"
					color={APP_COLOR.PRIMARY}
					animating={true}
				/>
			</View>
		);
	};

	return (
		<SafeAreaView edges={['top']} className="flex-1 bg-light-mode dark:bg-dark-mode">
			<StatusBar
				barStyle={"light-content"}
				backgroundColor={isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY}
			/>
			<NavigateHeader title={t('header')} showSearch />
			<FlatList
				data={posts}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={<NewsFeedComposer onCreate={handleCreate} currentUserAvatar={MOCK_POSTS[0].authorAvatar} />}
				renderItem={({ item }) => <PostItemComponent item={item} />}
				ListEmptyComponent={
					<View className="px-4 py-8">
						<Text className="text-center text-gray-500 dark:text-gray-400">
							{t('empty')}
						</Text>
					</View>
				}
				ListFooterComponent={renderFooter}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={isDark ? '#fff' : '#000'}
					/>
				}
				style={{
					backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
				}}
			/>
		</SafeAreaView>
	);
}