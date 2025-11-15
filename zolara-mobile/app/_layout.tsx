import '@/src/config/i18n';
import { useAuth } from '@/src/hooks/useAuth';
import { useLanguage } from '@/src/hooks/useLanguage';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

function RootLayoutContent() {
	const { isDark } = useTheme();
	useLanguage();
	const isAuthenticated = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated === null) return;
		if (isAuthenticated) {
			router.replace('/(screens)/(tabs)/conversation');
		} else if (!isAuthenticated) {
			router.replace('/(screens)/(auth)/welcome');
		}
	}, [isAuthenticated]);

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
				<RootLayoutContent />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
