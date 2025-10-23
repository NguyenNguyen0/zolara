import { Stack } from 'expo-router';

export default function ScreenLayout() {
	return (
		// <Stack initialRouteName="(auth)/welcome">
		<Stack initialRouteName="(tabs)">
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="splash" options={{ headerShown: false }} />
			<Stack.Screen
				name="(auth)/welcome"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/login.email"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/confirm.password"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/verify"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/login.success"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/signup.email"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/signup.name"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/signup.detail"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="(auth)/signup.avatar"
				options={{ headerShown: false }}
			/>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen
				name="(user)/conversation/[id]"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/search"
				options={{ headerShown: false, animation: 'fade' }}
			/>
			<Stack.Screen
				name="(user)/qr"
				options={{ headerShown: false, animation: 'fade' }}
			/>
			<Stack.Screen
				name="(user)/conversation/group.create"
				options={{ headerShown: false, animation: 'fade' }}
			/>
			<Stack.Screen
				name="(user)/contact/add.friend"
				options={{ headerShown: false, animation: 'fade' }}
			/>
			<Stack.Screen
				name="(user)/profile/setting"
				options={{ headerShown: false, animation: 'fade' }}
			/>
		</Stack>
	);
}
