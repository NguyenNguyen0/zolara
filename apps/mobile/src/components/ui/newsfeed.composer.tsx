import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { APP_COLOR } from '@/src/utils/constants';
import { PostImage } from '../item/post.item';
import Avatar from './avatar';

type Props = {
	onCreate: (text?: string, images?: string[]) => void;
	currentUserAvatar?: string;
};

const NewsFeedComposer: React.FC<Props> = ({ onCreate, currentUserAvatar }) => {
	const { t } = useTranslation('newsfeed');
	const [text, setText] = useState('');
	const [images, setImages] = useState<string[]>([]);

	const pickImages = async () => {
		// Backward/forward compatible mediaTypes to avoid deprecation warnings
		const mediaType = (ImagePicker as any)?.MediaType?.image ?? (ImagePicker as any)?.MediaTypeOptions?.Images;
		const res = await ImagePicker.launchImageLibraryAsync({
			// New API prefers ImagePicker.MediaType or an array of it
			mediaTypes: mediaType,
			allowsMultipleSelection: true,
			quality: 0.8,
			selectionLimit: 9,
		});
		if (!res.canceled) {
			setImages(res.assets.map((a) => a.uri));
		}
	};

	const submit = () => {
		if (!text && !images.length) return;
		onCreate(text || undefined, images.length ? images : undefined);
		setText('');
		setImages([]);
	};

	return (
		<View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
			<View className="flex-row gap-3 items-center">
				<Avatar uri={currentUserAvatar} />
				<View className="flex-1">
					<TextInput
						value={text}
						onChangeText={setText}
						placeholder={t('composer.placeholder') as string}
						placeholderTextColor="#9ca3af"
						multiline
						textAlignVertical="top"
						className="min-h-[40px] max-h-[120px] px-4 py-8 rounded-2xl bg-secondary-light dark:bg-secondary-dark text-dark-mode dark:text-light-mode"
					/>
					{images.length > 0 && (
						<View className="mt-3 flex-row flex-wrap gap-2">
							{images.map((uri, idx) => (
								<PostImage key={`preview-${idx}`} uri={uri} style={{ width: '48%', height: 96 }} />
							))}
						</View>
					)}
				</View>
			</View>

			<View className="flex-row items-center justify-end gap-3 mt-3">
				<TouchableOpacity onPress={pickImages}>
					<Ionicons name="image-outline" size={22} color={APP_COLOR.PRIMARY} />
				</TouchableOpacity>
				<TouchableOpacity onPress={submit} className="px-4 py-2 rounded-full bg-blue-500">
					<Text className="text-white text-sm font-medium">Post</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default NewsFeedComposer;


