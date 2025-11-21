import { Slot } from "expo-router";

export default function NewsLayout() {
  return <Slot screenOptions={{ headerShown: false }} />;
}
