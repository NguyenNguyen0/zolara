import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImagePreviewModal } from '@/components/customize/modal/image.preview.modal';
import { APP_COLOR } from '@/utils/constants';
import Avatar from '@/components/customize/ui/avatar';
import { ImageGrid } from '@/components/customize/ui/image.grid';

export type Post = {
	id: string;
	authorName: string;
	authorAvatar: string;
	authorVerified?: boolean;
	createdAt: string;
	content?: string;
	images?: string[];
	reactions: number;
	comments: number;
};

export const PostItem = ({ item }: { item: Post }) => {
	const [showImagePreview, setShowImagePreview] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const handleImagePress = (index: number) => {
		setSelectedImageIndex(index);
		setShowImagePreview(true);
	};

	return (
		<View className="py-3">
			{/* Header */}
			<View className="p-4 flex-row items-center gap-3">
				<Avatar uri={item.authorAvatar} />
				<View className="flex-1">
					<View className="flex-row items-center">
						<Text className="font-semibold text-gray-900">{item.authorName}</Text>
						{item.authorVerified ? (
							<Ionicons name="checkmark-circle" size={16} color={APP_COLOR.PRIMARY} style={{ marginLeft: 4 }} />
						) : null}
					</View>
					<Text className="text-xs text-gray-500">{item.createdAt}</Text>
				</View>
				<Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
			</View>

			{/* Content */}
			{item.content && (
				<Text className="px-4 mt-2 text-gray-900">{item.content}</Text>
			)}

			{/* Images */}
			<ImageGrid images={item.images || []} onImagePress={handleImagePress} />

			{/* Stats */}
			<View className="px-4 mt-2 flex-row items-center justify-between">
				<View className="flex-row items-center">
					<View className="h-5 w-5 rounded-full bg-pink-500 items-center justify-center">
						<Ionicons name="heart" size={12} color="#fff" />
					</View>
					<Text className="ml-1 text-xs text-gray-500">{item.reactions.toLocaleString()}</Text>
				</View>
				<Text className="text-xs text-gray-500">{item.comments} bình luận</Text>
			</View>

			{/* Actions */}
			<View className="mt-2 border-t border-b border-gray-200 flex-row">
				<TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2">
						<Ionicons name='heart-outline' size={18} color="#9ca3af" />
						<Text className="text-sm text-gray-700">Thích</Text>
				</TouchableOpacity>
				<TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2">
						<Ionicons name='chatbubble-outline' size={18} color="#9ca3af" />
						<Text className="text-sm text-gray-700">Bình luận</Text>
				</TouchableOpacity>
			</View>

			{/* Image Preview Modal */}
			{item.images && item.images.length > 0 && (
				<ImagePreviewModal
					visible={showImagePreview}
					images={item.images}
					initialIndex={selectedImageIndex}
					onClose={() => setShowImagePreview(false)}
				/>
			)}
		</View>
	);
};

export default PostItem;
