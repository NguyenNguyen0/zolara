import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { store } from '@/src/store';
import { Provider } from 'react-redux';
import '@/global.css';
import '@/src/config/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	//   const [loaded] = useFonts({
	//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	//   });

	//   useEffect(() => {
	//     if (loaded) {
	//       SplashScreen.hideAsync();
	//     }
	//   }, [loaded]);

	//   if (!loaded) {
	//     return null;
	//   }

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<Provider store={store}>
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
				</Provider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
