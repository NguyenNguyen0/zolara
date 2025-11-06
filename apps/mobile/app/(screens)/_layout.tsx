import { Stack } from 'expo-router';

export default function ScreenLayout() {
	return (
		// <Stack initialRouteName="(tabs)">
		<Stack initialRouteName="(auth)/welcome">
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
			{/* not use */}
			{/* <Stack.Screen
				name="(auth)/verify"
				options={{ headerShown: false }}
			/> */}
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
				name="(user)/group.create"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/friend.request/add.friend"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/[id]"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/friend.request/index"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/setting/index"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/setting/account.security"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/setting/interface"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/setting/about"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			<Stack.Screen
				name="(user)/setting/support"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
			{/* chatbot */}
			<Stack.Screen
				name="(user)/chatbot"
				options={{ headerShown: false, animation: 'slide_from_right' }}
			/>
		</Stack>
	);
}
