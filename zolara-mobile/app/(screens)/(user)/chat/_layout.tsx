import { Slot } from "expo-router";

export default function ChatLayout() {
  return <Slot screenOptions={{ headerShown: false }} />;
}
