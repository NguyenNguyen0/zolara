import React, { useState } from 'react';
import { View, TouchableOpacity, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { ImagePreviewModal } from '../modal/image.preview.modal';
import { APP_COLOR } from '@/src/utils/constants';

const DEFAULT_AVATAR = require('@/src/assets/default/avatar-default.jpg');

interface ShareAvatarProps {
	imageUri?: string | null;
	onImageChange?: (uri: string | null) => void;
	showCameraButton?: boolean; // Control camera button visibility
	size?: number; // Custom avatar size (default: 150)
}

export default function ShareAvatar({
	imageUri,
	onImageChange,
	showCameraButton = true, // Default show camera button
	size = 150, // Default avatar size
}: ShareAvatarProps) {
	const [imageModalVisible, setImageModalVisible] = useState(false);
	const [imageError, setImageError] = useState(false);

	// Reset error state when imageUri changes
	React.useEffect(() => {
		setImageError(false);
	}, [imageUri]);

	// Get the actual image source to display
	const currentImageSource = (imageUri && !imageError)
		? { uri: imageUri }
		: DEFAULT_AVATAR;

	// Get preview image URI (use RNImage.resolveAssetSource for default image)
	const previewImageUri = (imageUri && !imageError)
		? imageUri 
		: RNImage.resolveAssetSource(DEFAULT_AVATAR).uri;

	const handleAvatarPress = () => {
		setImageModalVisible(true);
	};

	const handleCameraPress = () => {
		console.log('take photo');
	};

	// Calculate icon size based on avatar size
	const iconSize = Math.max(16, Math.min(24, size / 6));

	return (
		<>
			<View className="relative">
				<TouchableOpacity
					activeOpacity={0.8}
					onPress={handleAvatarPress}
				>
					<Image
						source={currentImageSource}
						style={{
							width: size,
							height: size,
							borderRadius: size / 2,
						}}
						contentFit="cover"
						onError={(error) => {
							console.log('Avatar load error:', error);
							setImageError(true);
						}}
						transition={200}
					/>
				</TouchableOpacity>

				{/* Camera button - only show if showCameraButton is true */}
				{showCameraButton && (
					<TouchableOpacity
						className="absolute bottom-1 right-1 rounded-full p-1.5"
						style={{ backgroundColor: APP_COLOR.PRIMARY }}
						activeOpacity={0.8}
						onPress={handleCameraPress}
					>
						<MaterialIcons name="camera-alt" size={iconSize} color="white" />
					</TouchableOpacity>
				)}
			</View>

			{/* Image Preview Modal - always show */}
			<ImagePreviewModal
				visible={imageModalVisible}
				images={[previewImageUri]}
				initialIndex={0}
				onClose={() => setImageModalVisible(false)}
			/>
		</>
	);
}
