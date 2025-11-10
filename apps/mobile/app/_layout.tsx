import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { store } from '@/src/store';
import { Provider } from 'react-redux';
import '@/global.css';
import '@/src/config/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { setupAxiosInterceptors } from '@/src/config/axios.client';
import { setupDebugAuth } from '@/src/utils/debugAuth';

// SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
	const { isDark } = useTheme();

	// Setup axios interceptors
	useEffect(() => {
		setupAxiosInterceptors(store.dispatch, store.getState);
		setupDebugAuth(store.getState);
	}, []);

	return (
		<>
			<StatusBar style="light" backgroundColor={isDark ? APP_COLOR.DARK_MODE : APP_COLOR.PRIMARY} />
			<Stack>
				<Stack.Screen
					name="(screens)"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="+not-found"
					options={{ headerShown: false }}
				/>
			</Stack>
		</>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<Provider store={store}>
					<RootLayoutContent />
				</Provider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
