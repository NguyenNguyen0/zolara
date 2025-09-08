import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

interface ShareAvatarProps {
	imageUri?: string | null;
	onImageChange: (uri: string | null) => void;
	size?: number;
	placeholderInitials?: string;
	backgroundColor?: string;
	textColor?: string;
}

export default function ShareAvatar({
	imageUri,
	onImageChange,
	size = 140,
	placeholderInitials = 'T',
	backgroundColor = '#66BB6A',
	textColor = 'white',
}: ShareAvatarProps) {
	const { t } = useTranslation('signup-avatar');

	const pickImageFromLibrary = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission', t('permissionDenied'));
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.9,
		});
		if (!result.canceled) {
			onImageChange(result.assets[0].uri);
		}
	};

	const takePhoto = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission', t('permissionDenied'));
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.9,
		});
		if (!result.canceled) {
			onImageChange(result.assets[0].uri);
		}
	};

	const avatarPlaceholder = useMemo(
		() => (
			<View
				className="items-center justify-center rounded-full"
				style={{
					width: size,
					height: size,
					backgroundColor,
				}}
			>
				<Text
					className="font-bold"
					style={{
						color: textColor,
						fontSize: size * 0.2,
					}}
				>
					{placeholderInitials}
				</Text>
			</View>
		),
		[size, backgroundColor, textColor, placeholderInitials],
	);

	return (
		<TouchableOpacity activeOpacity={0.8} onPress={pickImageFromLibrary}>
			{imageUri ? (
				<Image
					source={{ uri: imageUri }}
					style={{
						width: size,
						height: size,
						borderRadius: size / 2,
					}}
				/>
			) : (
				avatarPlaceholder
			)}
		</TouchableOpacity>
	);
}
