import { Stack } from 'expo-router';
import '@/global.css';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import '@/src/utils/i18n';
import { ThemeProvider } from '@/src/contexts/ThemeContext';

export default function RootLayout() {
	return (
		<ThemeProvider>
			<Provider store={store}>
				<Stack
					screenOptions={{
						headerTintColor: 'blue',
						headerTitleStyle: {
							color: 'black',
						},
					}}
				>
					<Stack.Screen
						name="index"
						options={{ headerShown: false }}
					/>
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
						name="(tabs)"
						options={{ headerShown: false }}
					/>
				</Stack>
			</Provider>
		</ThemeProvider>
	);
}
