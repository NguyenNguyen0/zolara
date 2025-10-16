import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../ui/avatar';
import { APP_COLOR } from '@/src/utils/constants';

export type NotificationType =
	| 'login'
	| 'add_friend'
	| 'comment'
	| 'mention'
	| 'like'
	| 'post'
	| 'birthday';

export interface NotificationItemProps {
	id: string;
	type: NotificationType;
	actor?: {
		name: string;
		avatar?: string;
		verified?: boolean;
	};
	content: string;
	timestamp: string;
	isRead?: boolean;
	onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	type,
	actor,
	content,
	timestamp,
	isRead = false,
	onPress,
}) => {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();

	const getNotificationIcon = () => {
		const iconSize = 14;
		switch (type) {
			case 'login':
				return (
					<View className="bg-blue-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="shield-checkmark"
							size={iconSize}
							color={APP_COLOR.LIGHT_MODE}
						/>
					</View>
				);
			case 'add_friend':
				return (
					<View className="bg-green-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="person-add"
							size={iconSize}
							color={APP_COLOR.LIGHT_MODE}
						/>
					</View>
				);
			case 'comment':
				return (
					<View className="bg-purple-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="chatbubble"
							size={iconSize}
							color={APP_COLOR.LIGHT_MODE}
						/>
					</View>
				);
			case 'mention':
				return (
					<View className="bg-orange-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="at" size={iconSize} color={APP_COLOR.LIGHT_MODE} />
					</View>
				);
			case 'like':
				return (
					<View className="bg-red-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="heart" size={iconSize} color={APP_COLOR.LIGHT_MODE} />
					</View>
				);
			case 'post':
				return (
					<View className="bg-indigo-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="play-circle" size={iconSize} color={APP_COLOR.LIGHT_MODE} />
					</View>
				);
			case 'birthday':
				return (
					<View className="bg-pink-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="gift" size={iconSize} color={APP_COLOR.LIGHT_MODE} />
					</View>
				);
			default:
				return (
					<View className="bg-gray-500 rounded-full p-1 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="notifications"
							size={iconSize}
							color={APP_COLOR.LIGHT_MODE}
						/>
					</View>
				);
		}
	};

	const renderNotificationText = () => {
		if (actor) {
			return (
				<View className='flex-row flex-wrap items-center'>
					<Text className="text-sm font-semibold text-gray-900 dark:text-white">
						{actor.name}
					</Text>
					<View className='mx-1'>
						{actor.verified && (
						<Ionicons
							name="checkmark-circle"
							size={16}
							color={APP_COLOR.PRIMARY}
						/>
					)}
					</View>
					<Text className="text-sm text-gray-900 dark:text-white">
						{content}
					</Text>
				</View>
			);
		}

		return (
			<Text className="text-sm text-gray-900 dark:text-white">
				{content}
			</Text>
		);
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			className={`flex-row p-4 border-b border-gray-200 dark:border-gray-700 bg-light-mode dark:bg-dark-mode ${
				!isRead ? 'opacity-100' : 'opacity-90'
			}`}
			activeOpacity={0.7}
		>
			{/* Avatar with Icon Badge */}
			<View className="mr-3">
				<View className="relative">
					<Avatar uri={actor?.avatar} />
					{/* Icon Badge */}
					<View className="absolute -bottom-3 right-0">
						{getNotificationIcon()}
					</View>
				</View>
			</View>

			{/* Content */}
			<View className="flex-1">
				<View className="mb-1">{renderNotificationText()}</View>
				<Text className="text-xs text-gray-500 dark:text-gray-400">
					{timestamp}
				</Text>
			</View>

			{/* Unread Indicator */}
			{!isRead && (
				<View className="w-2 h-2 bg-blue-500 rounded-full" />
			)}
		</TouchableOpacity>
	);
};

export default NotificationItem;
