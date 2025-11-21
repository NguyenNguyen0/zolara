import { APP_COLOR } from '@/utils/constants';
import { getStatusText, getStatusColor } from '@/utils/convertHelper';
import {
	StatusBar,
	View,
	Text,
	TouchableOpacity,
	Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ConversationHeaderProps {
	name: string;
	status: 'stranger' | 'friend' | 'friend_request' | 'chatbot';
	onlineStatus?: string;
	isGroup?: boolean;
	showCallButtons?: boolean; // Option to show/hide call and video call buttons
	onCall?: () => void;
	onVideoCall?: () => void;
	onMenu?: () => void;
	onAcceptFriendRequest?: () => void;
}

export default function MessageHeader({
	name,
	status,
	onlineStatus,
	isGroup = false,
	showCallButtons = true,
	onCall,
	onVideoCall,
	onMenu,
	onAcceptFriendRequest,
}: ConversationHeaderProps) {
	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor={APP_COLOR.PRIMARY}
			/>
			<View className="bg-primary border-b-[1px] border-gray-200">
				<View className="m-4">
					<View className="flex-row items-center justify-between">
						{/* Left side - Back button and user info */}
						<View className="flex-row items-center flex-1">
							<TouchableOpacity
								onPress={() => {}}
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
										className={`px-2 py-1 rounded-full ${getStatusColor(status, false)}`}
									>
										<Text className="text-white text-xs font-medium">
											{getStatusText(
												status,
												isGroup,
												onlineStatus,
											)}
										</Text>
									</View>
								</View>
							</View>
						</View>

					{/* Right side - Action buttons */}
					<View className="flex-row gap-1">
						{showCallButtons && (
							<>
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
							</>
						)}

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
				<View className="bg-white border-t-[1px] border-gray-200 px-4 py-3 flex-row items-center justify-between">
					<Text className="text-gray-900 text-sm">
						Bạn cần chấp nhận lời mời kết bạn để bắt đầu trò chuyện
					</Text>
					<Pressable
						onPress={onAcceptFriendRequest}
						className="bg-blue-500 px-4 py-2 rounded-lg"
					>
						<Text className="text-white text-sm font-medium">
							Chấp nhận
						</Text>
					</Pressable>
				</View>
			)}
			</View>
		</>
	);
}
