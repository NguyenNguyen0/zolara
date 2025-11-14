import { View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface AgentIconProps {
	size?: number;
	showBorder?: boolean;
}

export default function AgentIcon({
	size = 40,
	showBorder = false
}: AgentIconProps) {
	const iconSize = size * 0.5; // Icon should be half the circle size

	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				overflow: 'hidden',
				position: 'relative',
				...(showBorder && {
					borderWidth: 2,
					borderColor: '#E5E7EB',
				}),
			}}
		>
			{/* Enhanced gradient background using overlapping views */}
			{/* Base layer - indigo */}
			<View
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					backgroundColor: '#6366F1', // indigo-500
				}}
			/>
			{/* Top layer - pink with offset positioning */}
			<View
				style={{
					position: 'absolute',
					width: '120%',
					height: '120%',
					backgroundColor: '#EC4899', // pink-500
					opacity: 0.6,
					top: '-10%',
					right: '-10%',
					borderRadius: size,
				}}
			/>
			{/* Overlay for smoother gradient effect */}
			<View
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					backgroundColor: '#A855F7', // purple-500
					opacity: 0.3,
				}}
			/>

			{/* Icon container */}
			<View
				style={{
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					zIndex: 10,
				}}
			>
				<MaterialIcons
					name="auto-awesome"
					size={iconSize}
					color="white"
				/>
			</View>
		</View>
	);
}
