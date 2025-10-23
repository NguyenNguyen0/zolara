import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import DividerSpacing from './divider.spacing';
import ShareAvatar from '../input/share.avatar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { APP_COLOR } from '@/src/utils/constants';
import { router } from 'expo-router';

const DEFAULT_COVER = require('@/src/assets/default/background-default.jpg');

interface User {
	name: string;
	bio: string;
	avatar: string;
	coverImage: string;
	verified: boolean;
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
	const coverSource =
		user.coverImage && !coverError
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
				{/* Cover Image Container */}
				<View className="w-full h-48">
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={() => onCoverPress(getActualCoverUri())}
						className="w-full h-full"
					>
						{/* Background Image */}
						<Image
							source={coverSource}
							style={{ width: '100%', height: '100%' }}
							contentFit="cover"
							onError={(error) => {
								console.log('Cover image load error:', error);
								setCoverError(true);
							}}
							transition={200}
						/>

						{/* Overlay Layer */}
						<View className="absolute inset-0 bg-black/45" />
					</TouchableOpacity>
				</View>

				{/* Avatar - positioned to overlap cover */}
				<View className="absolute -bottom-16 left-1/2 -ml-[75px] z-10">
					<ShareAvatar
						imageUri={user.avatar}
						showCameraButton={false}
					/>
				</View>

				{/* Settings Button */}
				<View className="absolute top-3 right-3 z-10">
					<TouchableOpacity
						onPress={() =>
							router.navigate('/(screens)/(user)/profile/setting')
						}
						className="w-10 h-10 items-center justify-center"
						activeOpacity={0.7}
					>
						<MaterialIcons
							name="settings"
							size={26}
							color="white"
						/>
					</TouchableOpacity>
				</View>
			</View>

			{/* Profile Info */}
			<View className="mt-20 px-4 mb-5">
				{/* Name */}
				<View className="flex-row items-center justify-center gap-1">
					<Text className="text-2xl font-bold text-center text-dark-mode dark:text-light-mode">
						{user.name}
					</Text>
					{user.verified ? (
						<View className="ml-1">
							<Ionicons
								name="checkmark-circle"
								size={16}
								color={APP_COLOR.PRIMARY}
							/>
						</View>
					) : null}
				</View>
				{/* Bio */}
				<Text className="text-base text-center text-gray-600 dark:text-gray-400 mt-1">
					{user.bio}
				</Text>
			</View>
			<DividerSpacing />
		</>
	);
}
