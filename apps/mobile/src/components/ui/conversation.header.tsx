import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { getStatusText, getStatusColor } from '@/src/utils/convertHelper';
import {
	StatusBar,
	View,
	Text,
	TouchableOpacity,
	Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ConversationHeaderProps {
	name: string;
	status: 'stranger' | 'friend' | 'friend_request';
	onlineStatus?: string;
	isGroup?: boolean;
	onCall?: () => void;
	onVideoCall?: () => void;
	onMenu?: () => void;
	onAcceptFriendRequest?: () => void;
}

export default function ConversationHeader({
	name,
	status,
	onlineStatus,
	isGroup = false,
	onCall,
	onVideoCall,
	onMenu,
	onAcceptFriendRequest,
}: ConversationHeaderProps) {
	const { isDark } = useTheme();
	const router = useRouter();

	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor={`${isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY}`}
			/>
			<View
				className={`${isDark ? 'bg-dark-mode' : 'bg-primary'}`}
				style={{
					borderBottomColor: isDark
						? APP_COLOR.GRAY_700
						: APP_COLOR.GRAY_200,
					borderBottomWidth: 1,
				}}
			>
				<View className="m-4">
					<View className="flex-row items-center justify-between">
						{/* Left side - Back button and user info */}
						<View className="flex-row items-center flex-1">
							<TouchableOpacity
								onPress={() => router.back()}
								className="w-10 h-10 rounded-full items-center justify-center mr-3"
							>
								<MaterialIcons
									name="arrow-back-ios-new"
									size={26}
									color="white"
								/>
							</TouchableOpacity>

							<View className="flex-1">
								<Text
									className="text-white text-lg font-bold"
									numberOfLines={1}
								>
									{name}
								</Text>
								<View className="flex-row items-center mt-1">
									<View
										className={`px-2 py-1 rounded-full ${getStatusColor(status, isGroup)}`}
									>
										<Text className="text-white text-xs font-medium">
											{getStatusText(
												status,
												isGroup,
												onlineStatus
											)}
										</Text>
									</View>
								</View>
							</View>
						</View>

						{/* Right side - Action buttons */}
						<View className="flex-row gap-1">
							<TouchableOpacity
								onPress={onCall}
								className="w-10 h-10 rounded-full items-center justify-center"
							>
								<MaterialIcons
									name="call"
									size={26}
									color="white"
								/>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={onVideoCall}
								className="w-10 h-10 rounded-full items-center justify-center"
							>
								<MaterialIcons
									name="videocam"
									size={26}
									color="white"
								/>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={onMenu}
								className="w-10 h-10 rounded-full items-center justify-center"
							>
								<MaterialIcons
									name="more-vert"
									size={26}
									color="white"
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* Friend request bar */}
				{status === 'friend_request' && (
					<View className="bg-gray-100 px-4 py-3 flex-row items-center justify-between">
						<Text className="text-gray-800 text-sm">
							Sent you a friend request
						</Text>
						<Pressable
							onPress={onAcceptFriendRequest}
							className="bg-blue-500 px-4 py-2 rounded-lg"
						>
							<Text className="text-white text-sm font-medium">
								Accept
							</Text>
						</Pressable>
					</View>
				)}
			</View>
		</>
	);
}