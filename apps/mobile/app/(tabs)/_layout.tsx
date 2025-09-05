import { APP_COLOR } from '@/src/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const getIcons = (routeName: string, focused: boolean, size: number) => {
	let iconName: keyof typeof Ionicons.glyphMap;

	switch (routeName) {
		case 'index':
			iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
			break;
		case 'contact':
			iconName = focused ? 'people' : 'people-outline';
			break;
		case 'timeline':
			iconName = focused ? 'time' : 'time-outline';
			break;
		case 'notification':
			iconName = focused ? 'notifications' : 'notifications-outline';
			break;
		case 'profile':
			iconName = focused ? 'person' : 'person-outline';
			break;
		default:
			iconName = 'help-circle';
	}

	return (
		<Ionicons
			name={iconName}
			size={size}
			color={focused ? APP_COLOR.PRIMARY : 'gray'}
		/>
	);
};

const TabLayout = () => {
	return (
		<Tabs
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					height: 50,
					paddingBottom: 5,
					backgroundColor: '#fff',
				},
				tabBarIcon: ({ focused, color, size }) => {
					return getIcons(route.name, focused, size);
				},
				tabBarLabelStyle: { paddingBottom: 5 },
				tabBarActiveTintColor: APP_COLOR.PRIMARY,
			})}
		>
			<Tabs.Screen name="index" options={{ title: 'Messages' }} />
			<Tabs.Screen name="contact" options={{ title: 'Contacts' }} />
			<Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
			<Tabs.Screen
				name="notification"
				options={{ title: 'Notifications' }}
			/>
			<Tabs.Screen name="profile" options={{ title: 'Me' }} />
		</Tabs>
	);
};

export default TabLayout;
