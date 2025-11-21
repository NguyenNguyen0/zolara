import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
    </Stack>
  );
}

