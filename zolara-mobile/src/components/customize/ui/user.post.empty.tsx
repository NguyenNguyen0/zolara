import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileEmptyProps {
	userName: string;
}

export default function UserPostEmpty({ userName }: ProfileEmptyProps) {
	return (
		<View className="px-4 mt-8 items-center pb-8">
			{/* Icon Illustration */}
			<View className="relative mb-6">
				<View className="bg-gray-100 rounded-3xl p-8 items-center justify-center">
					<Ionicons
						name="document-text-outline"
						size={64}
						color="#9ca3af"
					/>
				</View>
			</View>

			{/* Title */}
			<Text className="text-xl font-bold text-center text-gray-900 mb-3">
				{userName.split(' ')[0]} chưa có bài viết nào
			</Text>

			{/* Subtitle */}
			<Text className="text-sm text-center text-gray-600 mb-6 px-8">
				Hãy là người đầu tiên chia sẻ với {userName.split(' ')[0]}!
			</Text>

			{/* CTA Button */}
			<TouchableOpacity
				className="bg-blue-600 rounded-full px-8 py-4"
				activeOpacity={0.8}
			>
				<Text className="text-white font-semibold text-base">
					Tạo bài viết
				</Text>
			</TouchableOpacity>
		</View>
	);
}
