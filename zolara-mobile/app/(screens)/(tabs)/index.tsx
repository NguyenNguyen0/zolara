import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeConversations from "@/components/HomeConversations";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top > 0 ? 0 : 10,
        paddingBottom: insets.bottom > 0 ? 0 : 10,
      }}
    >
      <HomeConversations />
    </View>
  );
}
