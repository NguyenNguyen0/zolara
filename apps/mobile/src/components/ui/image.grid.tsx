import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type PostImageProps = {
	uri: string;
	style?: any;
};

const PostImage = memo(({ uri, style }: PostImageProps) => {
	const [failed, setFailed] = useState(false);

	const handleError = useCallback(() => setFailed(true), []);

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
			onError={handleError}
		/>
	);
});

PostImage.displayName = 'PostImage';

type ImageGridProps = {
	images: string[];
	onImagePress?: (index: number) => void;
};

export const ImageGrid = memo(({ images, onImagePress }: ImageGridProps) => {
	if (!images?.length) return null;

	const gridStyles = useMemo(() => ({
		1: { height: 256, width: '100%' },
		2: { height: 200 },
		3: { height: 160 },
		4: { height: 160 },
	} as const), []);

	const handleImagePress = useCallback((index: number) => {
		onImagePress?.(index);
	}, [onImagePress]);

	const renderSingleImage = useCallback(() => (
		<TouchableOpacity onPress={() => handleImagePress(0)} activeOpacity={0.9}>
			<PostImage uri={images[0]} style={gridStyles[1]} />
		</TouchableOpacity>
	), [images, gridStyles, handleImagePress]);

	const renderTwoImages = useCallback(() => (
		<View className="flex-row gap-2 px-4">
			{images.map((uri, idx) => (
				<TouchableOpacity 
					key={`img-${idx}`} 
					className="flex-1" 
					style={gridStyles[2]}
					onPress={() => handleImagePress(idx)}
					activeOpacity={0.9}
				>
					<PostImage uri={uri} style={{ height: '100%', width: '100%' }} />
				</TouchableOpacity>
			))}
		</View>
	), [images, gridStyles, handleImagePress]);

	const renderThreeImages = useCallback(() => (
		<View className="gap-2 px-4">
			<View className="flex-row gap-2">
				{images.slice(0, 2).map((uri, idx) => (
					<TouchableOpacity 
						key={`img-${idx}`} 
						className="flex-1" 
						style={gridStyles[3]}
						onPress={() => handleImagePress(idx)}
						activeOpacity={0.9}
					>
						<PostImage uri={uri} style={{ height: '100%', width: '100%' }} />
					</TouchableOpacity>
				))}
			</View>
			<TouchableOpacity onPress={() => handleImagePress(2)} activeOpacity={0.9}>
				<PostImage uri={images[2]} style={{ height: 160, width: '100%' }} />
			</TouchableOpacity>
		</View>
	), [images, gridStyles, handleImagePress]);

	const renderMultipleImages = useCallback(() => {
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
									onPress={() => handleImagePress(imageIndex)}
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
	}, [images, gridStyles, handleImagePress]);

	const renderMap = useMemo<Record<number, () => React.ReactElement>>(() => ({
		1: renderSingleImage,
		2: renderTwoImages,
		3: renderThreeImages,
	}), [renderSingleImage, renderTwoImages, renderThreeImages]);

	const renderer = renderMap[images.length] || renderMultipleImages;
	
	return <View className="mt-2">{renderer()}</View>;
});

ImageGrid.displayName = 'ImageGrid';
