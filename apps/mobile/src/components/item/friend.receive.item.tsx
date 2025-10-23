import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import Avatar from '../ui/avatar';
import { FriendRequest } from '@/src/mocks/friend.request';
import { Ionicons } from '@expo/vector-icons';

interface FriendReceiveItemProps {
	request: FriendRequest;
	onAccept: (request: FriendRequest) => void;
	onReject: (request: FriendRequest) => void;
	onPress?: (request: FriendRequest) => void;
}

export default function FriendReceiveItem({
	request,
	onAccept,
	onReject,
	onPress,
}: FriendReceiveItemProps) {
	const { isDark } = useTheme();

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

					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={(e) => {
								e.stopPropagation();
								onReject(request);
							}}
							activeOpacity={0.8}
							className="px-4 py-2 rounded-lg"
							style={{ backgroundColor: isDark ? APP_COLOR.GRAY_700 : APP_COLOR.GRAY_200 }}
						>
							<Text className={`text-sm font-medium ${isDark ? 'text-light-mode' : 'text-dark-mode'}`}>
								Từ chối
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={(e) => {
								e.stopPropagation();
								onAccept(request);
							}}
							activeOpacity={0.8}
							className="px-4 py-2 rounded-lg"
							style={{ backgroundColor: APP_COLOR.PRIMARY }}
						>
							<Text className="text-sm font-medium text-white">
								Đồng ý
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}


