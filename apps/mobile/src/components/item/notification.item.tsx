import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export type NotificationType =
	| 'login'
	| 'add_friend'
	| 'comment'
	| 'invite_group'
	| 'like'
	| 'birthday';

export interface NotificationItemProps {
	id: string;
	type: NotificationType;
	avatar?: string;
	userName?: string;
	message?: string;
	timestamp: string;
	isRead?: boolean;
	showActions?: boolean;
	onConfirm?: () => void;
	onDelete?: () => void;
	onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	type,
	avatar,
	userName,
	message,
	timestamp,
	isRead = false,
	showActions = false,
	onConfirm,
	onDelete,
	onPress,
}) => {
	const { t } = useTranslation('notification');
	const { isDark } = useTheme();

	const getNotificationIcon = () => {
		const iconColor = isDark ? '#fff' : '#000';
		const iconSize = 14;

		switch (type) {
			case 'login':
				return (
					<View className="bg-blue-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="shield-checkmark"
							size={iconSize}
							color="#fff"
						/>
					</View>
				);
			case 'add_friend':
				return (
					<View className="bg-green-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="person-add"
							size={iconSize}
							color="#fff"
						/>
					</View>
				);
			case 'comment':
				return (
					<View className="bg-purple-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="chatbubble"
							size={iconSize}
							color="#fff"
						/>
					</View>
				);
			case 'invite_group':
				return (
					<View className="bg-orange-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="people" size={iconSize} color="#fff" />
					</View>
				);
			case 'like':
				return (
					<View className="bg-red-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="heart" size={iconSize} color="#fff" />
					</View>
				);
			case 'birthday':
				return (
					<View className="bg-pink-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons name="gift" size={iconSize} color="#fff" />
					</View>
				);
			default:
				return (
					<View className="bg-gray-500 rounded-full p-1.5 border-2 border-light-mode dark:border-dark-mode">
						<Ionicons
							name="notifications"
							size={iconSize}
							color="#fff"
						/>
					</View>
				);
		}
	};

	const getNotificationText = () => {
		if (message) return message;

		const typeText = t(`types.${type}`);
		if (userName) {
			return `${userName} ${typeText}`;
		}
		return typeText;
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
					{avatar ? (
						<Image
							source={{ uri: avatar }}
							className="w-14 h-14 rounded-full"
						/>
					) : (
						<View className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
							<Ionicons
								name="person"
								size={24}
								color={isDark ? '#9ca3af' : '#6b7280'}
							/>
						</View>
					)}
					{/* Icon Badge */}
					<View className="absolute -bottom-3 right-0">
						{getNotificationIcon()}
					</View>
				</View>
			</View>

			{/* Content */}
			<View className="flex-1">
				<Text
					className="text-sm text-gray-900 dark:text-white mb-1"
					numberOfLines={3}
				>
					{getNotificationText()}
				</Text>
				<Text className="text-xs text-gray-500 dark:text-gray-400">
					{timestamp}
				</Text>

				{/* Action Buttons */}
				{showActions && (
					<View className="flex-row mt-3 space-x-2">
						<TouchableOpacity
							onPress={onConfirm}
							className="flex-1 bg-blue-500 rounded-lg py-2 px-4 mr-2"
							activeOpacity={0.8}
						>
							<Text className="text-white text-center font-semibold">
								{t('actions.confirm')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={onDelete}
							className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-lg py-2 px-4"
							activeOpacity={0.8}
						>
							<Text className="text-gray-700 dark:text-gray-200 text-center font-semibold">
								{t('actions.delete')}
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* Unread Indicator */}
			{!isRead && (
				<View className="ml-2">
					<View className="w-2 h-2 bg-blue-500 rounded-full" />
				</View>
			)}
		</TouchableOpacity>
	);
};

export default NotificationItem;
