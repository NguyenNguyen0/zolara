import { Slot } from "expo-router";

export default function InfoLayout() {
  return <Slot screenOptions={{ headerShown: false }} />;
}
