import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	RefreshControl,
	StatusBar,
	ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import Header from '@/src/components/commons/header';
import { APP_COLOR } from '@/src/utils/constants';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import PostItem, { Post } from '@/src/components/item/post.item';
import { ImagePreviewModal } from '@/src/components/modal/image.preview.modal';

export default function Profile() {
	const { t } = useTranslation('profile');
	const { isDark } = useTheme();
	const [refreshing, setRefreshing] = useState(false);
	const [imageModalVisible, setImageModalVisible] = useState(false);
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	// Mock user data - replace with real data
	const user = {
		name: 'Nguyen Van Minh',
		bio: t('bio'),
		website: 'nvminh162.id.vn',
		avatar: 'https://i.pravatar.cc/200?img=1',
		coverImage:
			'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
	};

	// Mock posts data - replace with real data from API
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

	// Handle image press
	const handleImagePress = (images: string[], index: number = 0) => {
		setSelectedImages(images);
		setSelectedImageIndex(index);
		setImageModalVisible(true);
	};

	// Render header component
	const renderHeader = () => (
		<>
			{/* Cover Image with Avatar */}
			<View className="relative">
				{/* Cover Image */}
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() => handleImagePress([user.coverImage], 0)}
				>
					<Image
						source={{ uri: user.coverImage }}
						className="w-full h-48"
						resizeMode="cover"
					/>
				</TouchableOpacity>

				{/* Avatar - positioned to overlap cover */}
				<View className="absolute -bottom-16 left-1/2 -ml-20">
					<View className="relative">
						<TouchableOpacity
							activeOpacity={0.9}
							onPress={() => handleImagePress([user.avatar], 0)}
						>
							<Image
								source={{ uri: user.avatar }}
								className="w-40 h-40 rounded-full border-4 border-light-mode dark:border-dark-mode"
							/>
						</TouchableOpacity>
						{/* Camera button on avatar */}
						<TouchableOpacity
							className="absolute bottom-2 right-2 bg-primary rounded-full p-2"
							activeOpacity={0.8}
						>
							<MaterialIcons
								name="camera-alt"
								size={20}
								color="white"
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Profile Info */}
			<View className="mt-20 px-4">
				{/* Name */}
				<Text className="text-2xl font-bold text-center text-dark-mode dark:text-light-mode">
					{user.name}
				</Text>

				{/* Bio */}
				<Text className="text-base text-center text-gray-600 dark:text-gray-400 mt-1">
					{user.bio}
				</Text>

				{/* Website */}
				<View className="flex-row items-center justify-center mt-2">
					<Text className="text-sm text-blue-600 dark:text-blue-400 font-medium">
						{user.website}
					</Text>
				</View>
			</View>

			{/* Divider */}
			<View className="mt-6 border-t-8 border-gray-200 dark:border-gray-800" />
		</>
	);

	// Render empty state
	const renderEmpty = () => (
		<View className="px-4 mt-8 items-center pb-8">
			{/* Icon Illustration */}
			<View className="relative mb-6">
				<View className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 items-center justify-center">
					<Ionicons
						name="document-text-outline"
						size={64}
						color={isDark ? '#6b7280' : '#9ca3af'}
					/>
				</View>
			</View>

			{/* Title */}
			<Text className="text-xl font-bold text-center text-dark-mode dark:text-light-mode mb-3">
				{t('emptyState.title', { name: user.name.split(' ')[0] })}
			</Text>

			{/* Subtitle */}
			<Text className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6 px-8">
				{t('emptyState.subtitle')}
			</Text>

			{/* CTA Button */}
			<TouchableOpacity
				className="bg-blue-600 rounded-full px-8 py-4"
				activeOpacity={0.8}
			>
				<Text className="text-white font-semibold text-base">
					{t('emptyState.button')}
				</Text>
			</TouchableOpacity>
		</View>
	);

	// Render post item
	const renderItem: ListRenderItem<Post> = ({ item }) => (
		<PostItem item={item} />
	);

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
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={isDark ? '#fff' : '#000'}
					/>
				}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={
					posts.length === 0 ? undefined : { paddingBottom: 24 }
				}
			/>

			{/* Image Preview Modal */}
			<ImagePreviewModal
				visible={imageModalVisible}
				images={selectedImages}
				initialIndex={selectedImageIndex}
				onClose={() => setImageModalVisible(false)}
			/>
		</SafeAreaView>
	);
}
