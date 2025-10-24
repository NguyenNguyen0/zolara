import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import Avatar from '../ui/avatar';
import { FriendRequest } from '@/src/mocks/friend.request';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface FriendSentItemProps {
	request: FriendRequest;
	onRecall: (request: FriendRequest) => void;
	onPress?: (request: FriendRequest) => void;
}

export default function FriendSentItem({
	request,
	onRecall,
	onPress,
}: FriendSentItemProps) {
	const { isDark } = useTheme();
	const { t } = useTranslation('friend-request');

	return (
		<View className="border-b border-gray-200 dark:border-gray-700">
			<TouchableOpacity onPress={() => onPress?.(request)} activeOpacity={0.7}>
				<View className="py-6 px-4 flex-row items-center justify-start">
					<Avatar uri={request.avatar} />
					<View className="flex-1 ml-3">
						<View className="flex-row items-center">
							<Text
								className={`text-base font-semibold ${isDark ? 'text-light-mode' : 'text-dark-mode'}`}
								numberOfLines={1}
							>
								{request.name}
							</Text>
							{request.verified && (
								<Ionicons
									name="checkmark-circle"
									size={16}
									color={APP_COLOR.PRIMARY}
									style={{ marginLeft: 4 }}
								/>
							)}
						</View>
						{request.timestamp && (
							<Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
								{request.timestamp.toLocaleDateString('vi-VN', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}
							</Text>
						)}
					</View>

				<TouchableOpacity
					onPress={(e) => {
						e.stopPropagation();
						onRecall(request);
					}}
					activeOpacity={0.8}
					className="px-4 py-2 rounded-lg"
					style={{ backgroundColor: isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_200 }}
				>
					<Text className={`text-sm font-medium ${isDark ? 'text-light-mode' : 'text-dark-mode'}`}>
						{t('recall')}
					</Text>
				</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</View>
	);
}


