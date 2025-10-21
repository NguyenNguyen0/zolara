import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface ImagePreviewModalProps {
	visible: boolean;
	images: string[];
	initialIndex?: number;
	onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
	visible,
	images,
	initialIndex = 0,
	onClose,
}) => {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const translateX = useSharedValue(0);
	const scale = useSharedValue(1);

	// Reset index when modal opens
	React.useEffect(() => {
		if (visible) {
			setCurrentIndex(initialIndex);
			translateX.value = 0;
			scale.value = 1;
		}
	}, [visible, initialIndex]);

	const goToNext = () => {
		if (currentIndex < images.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	const goToPrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	// Pan gesture for swiping
	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			translateX.value = event.translationX;
		})
		.onEnd((event) => {
			const shouldGoNext = event.translationX < -SWIPE_THRESHOLD && currentIndex < images.length - 1;
			const shouldGoPrev = event.translationX > SWIPE_THRESHOLD && currentIndex > 0;

			if (shouldGoNext) {
				translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
					runOnJS(goToNext)();
					translateX.value = 0;
				});
			} else if (shouldGoPrev) {
				translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
					runOnJS(goToPrevious)();
					translateX.value = 0;
				});
			} else {
				translateX.value = withSpring(0);
			}
		});

	// Pinch gesture for zooming
	const pinchGesture = Gesture.Pinch()
		.onUpdate((event) => {
			scale.value = Math.max(1, Math.min(event.scale, 3));
		})
		.onEnd(() => {
			scale.value = withSpring(1);
		});

	const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translateX.value },
			{ scale: scale.value },
		],
	}));

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<View className="flex-1 bg-black/90 justify-center items-center">
				{/* Close Button */}
				<TouchableOpacity
					className="absolute top-[50px] right-5 z-10 bg-black/50 rounded-[20px] p-2"
					onPress={onClose}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons name="close" size={32} color="#fff" />
				</TouchableOpacity>

				{/* Counter */}
				<View className="absolute top-[50px] left-5 z-10 bg-black/50 rounded-2xl px-4 py-2">
					<Text className="text-white text-base font-semibold">
						{currentIndex + 1} / {images.length}
					</Text>
				</View>

				{/* Image */}
				<GestureDetector gesture={composedGesture}>
					<Animated.View 
						style={[
							{ 
								width: SCREEN_WIDTH, 
								height: SCREEN_HEIGHT * 0.7,
							},
							animatedStyle
						]}
						className="justify-center items-center"
					>
						<Image
							source={{ uri: images[currentIndex] }}
							style={{ width: SCREEN_WIDTH, height: '100%' }}
							contentFit="contain"
						/>
					</Animated.View>
				</GestureDetector>

				{/* Navigation Arrows */}
				{currentIndex > 0 && (
					<TouchableOpacity
						className="absolute left-5 bg-black/50 rounded-[20px] p-2 z-[5]"
						onPress={goToPrevious}
						hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
					>
						<Ionicons name="chevron-back" size={32} color="#fff" />
					</TouchableOpacity>
				)}

				{currentIndex < images.length - 1 && (
					<TouchableOpacity
						className="absolute right-5 bg-black/50 rounded-[20px] p-2 z-[5]"
						onPress={goToNext}
						hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
					>
						<Ionicons name="chevron-forward" size={32} color="#fff" />
					</TouchableOpacity>
				)}
			</View>
		</Modal>
	);
};