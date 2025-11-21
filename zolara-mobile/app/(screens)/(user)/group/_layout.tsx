import { Stack } from "expo-router";

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create/index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="qr" />
    </Stack>
  );
}
