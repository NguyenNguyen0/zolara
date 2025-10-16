import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import Divider from './divider';
import ShareAvatar from '../input/share.avatar';

const DEFAULT_COVER = require('@/src/assets/default/background-default.jpg');
const SCREEN_WIDTH = Dimensions.get('window').width;
const COVER_HEIGHT = 192; // h-48 = 192px

interface User {
	name: string;
	bio: string;
	avatar: string;
	coverImage: string;
}

interface ProfileUserProps {
	user: User;
	onCoverPress: (imageUri: string) => void;
}

export default function ProfileUser({ user, onCoverPress }: ProfileUserProps) {
	const [coverError, setCoverError] = useState(false);

	// Reset error when coverImage changes
	React.useEffect(() => {
		setCoverError(false);
	}, [user.coverImage]);

	// Get cover source with fallback
	const coverSource = (user.coverImage && !coverError)
		? { uri: user.coverImage }
		: DEFAULT_COVER;

	// Get the actual image URI to pass to modal
	const getActualCoverUri = () => {
		if (user.coverImage && !coverError) {
			return user.coverImage;
		}
		// For local image, convert to URI format
		return RNImage.resolveAssetSource(DEFAULT_COVER).uri;
	};

	return (
		<>
			{/* Cover Image with Avatar */}
			<View className="relative">
				{/* Cover Image */}
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() => onCoverPress(getActualCoverUri())}
				>
					<Image
						source={coverSource}
						style={{
							width: SCREEN_WIDTH,
							height: COVER_HEIGHT,
						}}
						contentFit="cover"
						onError={(error) => {
							console.log('Cover image load error:', error);
							setCoverError(true);
						}}
						transition={200}
					/>
				</TouchableOpacity>

				{/* Avatar - positioned to overlap cover */}
				<View className="absolute -bottom-16 left-1/2 -ml-[75px]">
					<ShareAvatar
						imageUri={user.avatar}
						showCameraButton={false}
					/>
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
			</View>
			<Divider />
		</>
	);
}
