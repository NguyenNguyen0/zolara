import { Stack } from "expo-router";

export default function UserInfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit.info" />
    </Stack>
  );
}
