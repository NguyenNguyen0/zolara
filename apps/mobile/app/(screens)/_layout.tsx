import { Stack } from 'expo-router';

export default function ScreenLayout() {
	return (
		<Stack>
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
		</Stack>
	);
}
