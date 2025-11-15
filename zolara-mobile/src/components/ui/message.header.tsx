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
import { useTranslation } from 'react-i18next';

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
	const { isDark } = useTheme();
	const router = useRouter();
	const { t } = useTranslation('message-header');

	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor={isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY}
			/>
			<View className="bg-primary dark:bg-dark-mode border-b-[1px] border-secondary-light dark:border-secondary-dark">
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
				<View className="bg-light-mode dark:bg-dark-mode border-t-[1px] border-secondary-light dark:border-secondary-dark px-4 py-3 flex-row items-center justify-between">
					<Text className="text-dark-mode dark:text-light-mode text-sm">
						{t('friendRequestMessage')}
					</Text>
					<Pressable
						onPress={onAcceptFriendRequest}
						className="bg-blue-500 px-4 py-2 rounded-lg"
					>
						<Text className="text-white text-sm font-medium">
							{t('acceptButton')}
						</Text>
					</Pressable>
				</View>
			)}
			</View>
		</>
	);
}
