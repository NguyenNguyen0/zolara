import { APP_COLOR } from '@/src/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const notificationData = {
	messages: 1,
	contacts: true,
	newsfeed: false,
	notifications: true,
	profile: false,
};

const NotificationBadge = ({ count, showDot }: { count?: number; showDot?: boolean }) => {
	if (!count && !showDot) return null;

	return (
		<View className="absolute -top-0 -right-5">
			{count ? (
				<View className="bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-2 border border-white">
					<Text className="text-white text-[10px] font-bold text-center">
						{count > 9 ? '9+' : count}
					</Text>
				</View>
			) : showDot ? (
				<View className="bg-red-500 rounded-full w-2 h-2 border border-white" />
			) : null}
		</View>
	);
};

const getIconsWithBadge = (routeName: string, focused: boolean, size: number) => {
	let iconName: keyof typeof Ionicons.glyphMap;
	let badgeCount: number | undefined;
	let showDot = false;

	switch (routeName) {
		case 'index':
			iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
			badgeCount = notificationData.messages;
			break;
		case 'contact':
			iconName = focused ? 'people' : 'people-outline';
			showDot = notificationData.contacts;
			break;
		case 'newsfeed':
			iconName = focused ? 'newspaper-sharp' : 'newspaper-outline';
			showDot = notificationData.newsfeed;
			break;
		case 'notification':
			iconName = focused ? 'notifications' : 'notifications-outline';
			showDot = notificationData.notifications;
			break;
		case 'profile':
			iconName = focused ? 'person' : 'person-outline';
			showDot = notificationData.profile;
			break;
		default:
			iconName = 'help-circle';
	}

	return (
		<View className="relative items-center justify-center">
			<Ionicons
				name={iconName}
				size={size}
				color={focused ? APP_COLOR.PRIMARY : 'gray'}
			/>
			<NotificationBadge count={badgeCount} showDot={showDot} />
		</View>
	);
};

const TabLayout = () => {
	const insets = useSafeAreaInsets();
	return (
		<Tabs
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					height: 50 + insets.bottom,
					paddingBottom: insets.bottom,
					backgroundColor: '#fff',
					borderTopWidth: 0.5,
					borderTopColor: '#E5E5E5',
				},
				tabBarIcon: ({ focused, color, size }) => {
					return getIconsWithBadge(route.name, focused, size);
				},
				tabBarLabelStyle: { paddingBottom: 5 },
				tabBarActiveTintColor: APP_COLOR.PRIMARY,
				// hide gray effect when click tabs
				tabBarButton: (props: any) => (
					<TouchableOpacity
						{...props}
						activeOpacity={1}
						className="bg-transparent"
						style={props.style}
					/>
				),
			})}
		>
			<Tabs.Screen name="index" options={{ title: 'Messages' }} />
			<Tabs.Screen name="contact" options={{ title: 'Contacts' }} />
			<Tabs.Screen name="newsfeed" options={{ title: 'Newsfeed' }} />
			<Tabs.Screen
				name="notification"
				options={{ title: 'Notifications' }}
			/>
			<Tabs.Screen name="profile" options={{ title: 'Me' }} />
		</Tabs>
	);
};

export default TabLayout;
