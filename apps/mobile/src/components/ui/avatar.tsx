import React, { useState } from 'react';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';

// Local fallback avatar
const FALLBACK_AVATAR = require('@/src/assets/default/avatar-default.jpg');

interface AvatarProps {
	uri?: string;
	onPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ uri, onPress }) => {
	const [failed, setFailed] = useState(false);

	// Fixed size: 40x40 with full rounded
	const size = 40;
	const borderRadius = size / 2;

	const imageElement = (
		<Image
			source={!uri || failed ? FALLBACK_AVATAR : { uri }}
			style={{ height: size, width: size, borderRadius }}
			onError={() => setFailed(true)}
			contentFit="cover"
		/>
	);

	// If onPress is provided, wrap in TouchableOpacity
	if (onPress) {
		return (
			<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
				{imageElement}
			</TouchableOpacity>
		);
	}

	return imageElement;
};

export default Avatar;
