import { Text, View, TouchableOpacity } from "react-native";
import type { User } from "@repo/types";
import { useState } from "react";

export default function Index() {
  const [user, setUser] = useState<User>();
  return (
    <View className="flex items-center justify-center">
      <Text className="text-2xl text-amber-300 font-bold">Zolara</Text>

      <TouchableOpacity
        onPress={() => {
          setUser({ id: "1", name: "minh", email: "minh123@gmail.com" });
        }}
      >
        <Text className="">Show User</Text>
      </TouchableOpacity>

      <Text>{JSON.stringify(user)}</Text>
    </View>
  );
}
