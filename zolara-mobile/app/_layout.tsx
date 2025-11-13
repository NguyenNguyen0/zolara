import { setupAxiosInterceptors } from '@/src/config/axios.client';
import '@/src/config/i18n';
import { useTheme } from '@/src/hooks/useTheme';
import { store } from '@/src/store';
import { APP_COLOR } from '@/src/utils/constants';
import { setupDebugAuth } from '@/src/utils/debugAuth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import './global.css';

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
