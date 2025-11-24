import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SocketProvider } from "@/providers/SocketProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../src/assets/fonts/SpaceMono-Regular.ttf"),
  });
  const isAuthenticated = useAuth();
  const router = useRouter();

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle navigation based on authentication status
  useEffect(() => {
    // Wait until fonts are loaded and auth status is determined
    if (!loaded || isAuthenticated === null) {
      return;
    }

    if (isAuthenticated) {
      // Navigate to tabs if authenticated
      router.replace("/(screens)/(tabs)" as any);
    } else {
      // Navigate to welcome screen if not authenticated
      router.replace("/(screens)/(auth)/welcome" as any);
    }
  }, [loaded, isAuthenticated, router]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <GluestackUIProvider mode="light">
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <SocketProvider>
                <Stack>
                  <Stack.Screen name="(screens)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="light" />
              </SocketProvider>
            </ThemeProvider>
          </GluestackUIProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
