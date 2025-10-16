import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ImagePreviewModal } from '@/src/components/modal/image.preview.modal';
import { APP_COLOR } from '@/src/utils/constants';
import Avatar from '@/src/components/ui/avatar';

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

export const PostImage = ({ uri, style }: { uri: string; style?: any }) => {
	const [failed, setFailed] = useState(false);
	if (failed || !uri) {
		return (
			<View className="bg-gray-200 dark:bg-gray-800 items-center justify-center rounded-md" style={style}>
				<Ionicons name="image" size={28} color="#9ca3af" />
			</View>
		);
	}
	return (
		<Image
			source={{ uri }}
			className="rounded-md"
			style={style}
			contentFit="cover"
			onError={() => setFailed(true)}
		/>
	);
};

export const ImageGrid = ({ images, onImagePress }: { images: string[]; onImagePress?: (index: number) => void }) => {
	if (!images?.length) return null;

	const gridStyles = {
		1: { height: 256, width: '100%' },
		2: { height: 200 },
		3: { height: 160 },
		4: { height: 160 },
	} as const;

	const renderSingleImage = () => (
		<TouchableOpacity onPress={() => onImagePress?.(0)} activeOpacity={0.9}>
			<PostImage uri={images[0]} style={gridStyles[1]} />
		</TouchableOpacity>
	);

	const renderTwoImages = () => (
		<View className="flex-row gap-2 px-4">
			{images.map((uri, idx) => (
				<TouchableOpacity 
					key={`img-${idx}`} 
					className="flex-1" 
					style={gridStyles[2]}
					onPress={() => onImagePress?.(idx)}
					activeOpacity={0.9}
				>
					<PostImage uri={uri} style={{ height: '100%', width: '100%' }} />
				</TouchableOpacity>
			))}
		</View>
	);

	const renderThreeImages = () => (
		<View className="gap-2 px-4">
			<View className="flex-row gap-2">
				{images.slice(0, 2).map((uri, idx) => (
					<TouchableOpacity 
						key={`img-${idx}`} 
						className="flex-1" 
						style={gridStyles[3]}
						onPress={() => onImagePress?.(idx)}
						activeOpacity={0.9}
					>
						<PostImage uri={uri} style={{ height: '100%', width: '100%' }} />
					</TouchableOpacity>
				))}
			</View>
			<TouchableOpacity onPress={() => onImagePress?.(2)} activeOpacity={0.9}>
				<PostImage uri={images[2]} style={{ height: 160, width: '100%' }} />
			</TouchableOpacity>
		</View>
	);

	const renderMultipleImages = () => {
		const preview = images.slice(0, 4);
		return (
			<View className="gap-2 px-4">
				{[preview.slice(0, 2), preview.slice(2, 4)].map((row, rowIdx) => (
					<View key={`row-${rowIdx}`} className="flex-row gap-2">
						{row.map((uri, idx) => {
							const showOverlay = rowIdx === 1 && idx === 1 && images.length > 4;
							const imageIndex = rowIdx * 2 + idx;
							return (
								<TouchableOpacity 
									key={`img-${rowIdx}-${idx}`} 
									className="flex-1 relative" 
									style={gridStyles[4]}
									onPress={() => onImagePress?.(imageIndex)}
									activeOpacity={0.9}
								>
									<PostImage uri={uri} style={{ height: '100%', width: '100%' }} />
									{showOverlay && (
										<View className="absolute inset-0 bg-black/40 items-center justify-center rounded-md">
											<Text className="text-white text-xl font-semibold">+{images.length - 4}</Text>
										</View>
									)}
								</TouchableOpacity>
							);
						})}
					</View>
				))}
			</View>
		);
	};

	const renderMap: Record<number, () => React.ReactElement> = {
		1: renderSingleImage,
		2: renderTwoImages,
		3: renderThreeImages,
	};

	const renderer = renderMap[images.length] || renderMultipleImages;
	return <View className="mt-2">{renderer()}</View>;
};

export const PostItem = ({ item }: { item: Post }) => {
	const { t } = useTranslation('newsfeed');
	const [showImagePreview, setShowImagePreview] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const handleImagePress = (index: number) => {
		setSelectedImageIndex(index);
		setShowImagePreview(true);
	};

	return (
		<View className="py-3">
			{/* Header */}
			<View className="px-4 flex-row items-center gap-3">
				<Avatar uri={item.authorAvatar} />
				<View className="flex-1">
					<View className="flex-row items-center">
						<Text className="font-semibold text-gray-900 dark:text-gray-100">{item.authorName}</Text>
						{item.authorVerified ? (
							<Ionicons name="checkmark-circle" size={16} color={APP_COLOR.PRIMARY} style={{ marginLeft: 4 }} />
						) : null}
					</View>
					<Text className="text-xs text-gray-500 dark:text-gray-400">{item.createdAt}</Text>
				</View>
				<Ionicons name="ellipsis-horizontal" size={18} color="#9ca3af" />
			</View>

			{/* Content */}
			{item.content && (
				<Text className="px-4 mt-2 text-gray-900 dark:text-gray-100">{item.content}</Text>
			)}

			{/* Images */}
			<ImageGrid images={item.images || []} onImagePress={handleImagePress} />

			{/* Stats */}
			<View className="px-4 mt-2 flex-row items-center justify-between">
				<View className="flex-row items-center">
					<View className="h-5 w-5 rounded-full bg-pink-500 items-center justify-center">
						<Ionicons name="heart" size={12} color="#fff" />
					</View>
					<Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">{item.reactions.toLocaleString()}</Text>
				</View>
				<Text className="text-xs text-gray-500 dark:text-gray-400">{item.comments} comments</Text>
			</View>

			{/* Actions */}
			<View className="mt-2 border-t border-b border-gray-200 dark:border-gray-700 flex-row">
				<TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2">
						<Ionicons name='heart-outline' size={18} color="#9ca3af" />
						<Text className="text-sm text-gray-700 dark:text-gray-200">{t('actions.like')}</Text>
				</TouchableOpacity>
				<TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-2">
						<Ionicons name='chatbubble-outline' size={18} color="#9ca3af" />
						<Text className="text-sm text-gray-700 dark:text-gray-200">{t('actions.comment')}</Text>
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


