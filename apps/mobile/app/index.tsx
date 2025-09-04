import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import Button from "@/src/components/Button";

export default function Index() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleAuthNavigation = () => {
    router.push("/auth" as any);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl text-amber-500 font-bold mb-8">Zolara</Text>

      {user ? (
        <View className="w-full">
          <View className="bg-gray-100 p-4 rounded-lg mb-6">
            <Text className="text-lg font-medium mb-2">Welcome back!</Text>
            <Text className="text-gray-700 mb-1"><Text className="font-medium">Name:</Text> {user.name}</Text>
            <Text className="text-gray-700"><Text className="font-medium">Email:</Text> {user.email}</Text>
          </View>

          <Button
            title="Logout"
            variant="secondary"
            onPress={handleLogout}
          />
        </View>
      ) : (
        <View className="w-full">
          <Text className="text-gray-600 text-center mb-6">
            Please login or create an account to continue
          </Text>
          <Button
            title="Login / Register"
            onPress={handleAuthNavigation}
          />
        </View>
      )}
    </View>
  );
}
