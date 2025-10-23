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
import UserInfo from '@/src/components/ui/user.info';
import UserPostEmpty from '@/src/components/ui/user.post.empty';
import { MOCK_USER_PROFILE, MOCK_USER_POSTS } from '@/src/mocks/profile';

export default function ProfileTab() {
	const { t } = useTranslation('user');
	const { isDark } = useTheme();
	const [refreshing, setRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [coverModalVisible, setCoverModalVisible] = useState(false);
	const [actualCoverImage, setActualCoverImage] = useState<string>('');

	const user = MOCK_USER_PROFILE;

	const [posts, setPosts] = useState<Post[]>(MOCK_USER_POSTS);

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
		<UserInfo user={user} onCoverPress={handleCoverPress} />
	);

	// Render empty state
	const renderEmpty = () => <UserPostEmpty userName={user.name} />;

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
