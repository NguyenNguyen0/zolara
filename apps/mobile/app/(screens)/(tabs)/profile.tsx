import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	FlatList,
	RefreshControl,
	StatusBar,
	ListRenderItem,
	ActivityIndicator,
	View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import PostItem, { Post } from '@/src/components/item/post.item';
import { ImagePreviewModal } from '@/src/components/modal/image.preview.modal';
import ProfileUser from '@/src/components/ui/profile.user';
import ProfileEmpty from '@/src/components/ui/profile.empty';

export default function Profile() {
	const { t } = useTranslation('profile');
	const { isDark } = useTheme();
	const [refreshing, setRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [coverModalVisible, setCoverModalVisible] = useState(false);
	const [actualCoverImage, setActualCoverImage] = useState<string>('');

	const user = {
		name: 'Tokuda',
		bio: 'Not bio yet',
		avatar: 'https://i.pravatar.cc/200?img=1',
		coverImage:
			'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
	};

	const [posts, setPosts] = useState<Post[]>([
		{
			id: '1',
			authorName: user.name,
			authorAvatar: user.avatar,
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
			authorName: user.name,
			authorAvatar: user.avatar,
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
			authorName: user.name,
			authorAvatar: user.avatar,
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
	]);

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

	// Handle image press - receive the actual displayed image URI
	const handleCoverPress = (imageUri: string) => {
		setActualCoverImage(imageUri);
		setCoverModalVisible(true);
	};

	// Render header component
	const renderHeader = () => (
		<ProfileUser user={user} onCoverPress={handleCoverPress} />
	);

	// Render empty state
	const renderEmpty = () => <ProfileEmpty userName={user.name} />;

	// Render post item
	const renderItem: ListRenderItem<Post> = ({ item }) => (
		<PostItem item={item} />
	);

	// Render loading footer
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
		<SafeAreaView
			edges={['top']}
			className="flex-1 bg-light-mode dark:bg-dark-mode"
		>
			<StatusBar
				barStyle="light-content"
				backgroundColor={`${isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY}`}
			/>
			<FlatList
				data={posts}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={renderHeader}
				ListEmptyComponent={renderEmpty}
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
				showsVerticalScrollIndicator={false}
			/>

			{/* Image Preview Modal - Only for Cover Image */}
			<ImagePreviewModal
				visible={coverModalVisible}
				images={actualCoverImage ? [actualCoverImage] : []}
				initialIndex={0}
				onClose={() => setCoverModalVisible(false)}
			/>
		</SafeAreaView>
	);
}
