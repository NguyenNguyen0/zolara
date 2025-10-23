import { APP_COLOR } from '@/src/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/hooks/useTheme';

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
		case 'conversation':
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
		case 'user':
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
	const { t } = useTranslation('tabs');
	const { isDark } = useTheme();
	
	return (
		<Tabs
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					height: 50 + insets.bottom,
					paddingBottom: insets.bottom,
					backgroundColor: isDark ? APP_COLOR.DARK_MODE : APP_COLOR.LIGHT_MODE,
					borderTopWidth: 0.5,
					borderTopColor: isDark ? APP_COLOR.GRAY_200 : APP_COLOR.GRAY_700,
				},
				tabBarIcon: ({ focused, color, size }) => {
					return getIconsWithBadge(route.name, focused, size);
				},
				tabBarLabelStyle: { 
					paddingBottom: 5,
					color: isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.GRAY_700,
				},
				tabBarActiveTintColor: APP_COLOR.PRIMARY,
				tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
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
			<Tabs.Screen name="conversation" options={{ title: t('messages') }} />
			<Tabs.Screen name="contact" options={{ title: t('contacts') }} />
			<Tabs.Screen name="newsfeed" options={{ title: t('newsfeed') }} />
			<Tabs.Screen
				name="notification"
				options={{ title: t('notifications') }}
			/>
			<Tabs.Screen name="user" options={{ title: t('profile') }} />
		</Tabs>
	);
};

export default TabLayout;
