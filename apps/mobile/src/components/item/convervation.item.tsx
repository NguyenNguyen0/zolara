import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';

type Item = {
	name: string;
	message: string;
	time: string;
	avatar: string;
	verified?: boolean;
	unread?: number;
};

export default function MessageItem({ item }: { item: Item }) {
	const { name, message, time, avatar, verified, unread } = item;
	const { isDark } = useTheme();

	return (
		<Pressable
			android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
			className="px-4"
			style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
		>
			<View className="flex-row items-center py-3">
				<Image source={{ uri: avatar }} className="w-12 h-12 rounded-full mr-3" />
				<View className="flex-1">
					<View className="flex-row items-center">
						<Text className={`text-base font-semibold text-gray-900 ${isDark ? "text-light-mode" : "text-dark-mode"}`} numberOfLines={1}>
							{name}
						</Text>
						{verified ? (
							<Ionicons name="checkmark-circle" size={16} color="#0ea5e9" className="ml-1" />
						) : null}
					</View>
					<Text className="text-gray-500 mt-0.5" numberOfLines={1}>
						{message}
					</Text>
				</View>
				<View className="items-end">
					<Text className="text-gray-400 text-xs">{time}</Text>
					<View className="flex-row items-center mt-1">
						{unread && unread > 0 ? (
							<View className="bg-red-500 rounded-full w-2 h-2 ml-1" />
						) : null}
					</View>
				</View>
			</View>
		</Pressable>
	);
}

