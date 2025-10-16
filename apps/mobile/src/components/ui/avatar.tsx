import React, { useState } from 'react';
import { Image } from 'expo-image';

// Local fallback avatar
const FALLBACK_AVATAR = require('@/src/assets/default/avatar-default.jpg');

interface AvatarProps {
	uri?: string;
}

const Avatar: React.FC<AvatarProps> = ({ uri }) => {
	const [failed, setFailed] = useState(false);

	// Fixed size: 40x40 with full rounded
	const size = 40;
	const borderRadius = size / 2;

	// If no URI or failed, show fallback avatar
	if (!uri || failed) {
		return (
			<Image
				source={FALLBACK_AVATAR}
				style={{ height: size, width: size, borderRadius }}
				contentFit="cover"
			/>
		);
	}

	return (
		<Image
			source={{ uri }}
			style={{ height: size, width: size, borderRadius }}
			onError={() => setFailed(true)}
			contentFit="cover"
		/>
	);
};

export default Avatar;
