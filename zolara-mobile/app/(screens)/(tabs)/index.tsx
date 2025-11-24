import { View } from "react-native";
import HomeConversations from "@/components/HomeConversations";

export default function HomeScreen() {
  return (
    <View
      className="flex-1 bg-white"
    >
      <HomeConversations />
    </View>
  );
}
