import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';

interface ProfileEmptyProps {
	userName: string;
}

export default function ProfileEmpty({ userName }: ProfileEmptyProps) {
	const { t } = useTranslation('profile');
	const { isDark } = useTheme();

	return (
		<View className="px-4 mt-8 items-center pb-8">
			{/* Icon Illustration */}
			<View className="relative mb-6">
				<View className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 items-center justify-center">
					<Ionicons
						name="document-text-outline"
						size={64}
						color={isDark ? '#6b7280' : '#9ca3af'}
					/>
				</View>
			</View>

			{/* Title */}
			<Text className="text-xl font-bold text-center text-dark-mode dark:text-light-mode mb-3">
				{t('emptyState.title', { name: userName.split(' ')[0] })}
			</Text>

			{/* Subtitle */}
			<Text className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6 px-8">
				{t('emptyState.subtitle')}
			</Text>

			{/* CTA Button */}
			<TouchableOpacity
				className="bg-blue-600 rounded-full px-8 py-4"
				activeOpacity={0.8}
			>
				<Text className="text-white font-semibold text-base">
					{t('emptyState.button')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
