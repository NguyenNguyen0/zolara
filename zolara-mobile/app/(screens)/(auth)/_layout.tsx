import "@/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function AuthenticationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login.email"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="confirm.password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login.success"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup.email"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup.name"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup.detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

