import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Input from "@/src/components/Input";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/hooks/useAuth";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "@/src/utils/validation";

type AuthMode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
  });

  const router = useRouter();
  const { login, register, isLoading, error, user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    // Reset form and errors
    setErrors({ email: "", password: "", name: "" });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: !validateEmail(email) ? "Please enter a valid email address" : "",
      password: !validatePassword(password)
        ? "Password must be at least 6 characters"
        : "",
      name:
        mode === "register" && !validateName(name)
          ? "Name must be at least 2 characters"
          : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (mode === "login") {
      const success = await login(email, password);
      if (success) {
        router.replace("/");
      }
    } else {
      const success = await register(email, password, name);
      if (success) {
        router.replace("/");
      }
    }
  };

  // Show error from auth operations
  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
    }
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-amber-500 mb-2">
                Zolara
              </Text>
              <Text className="text-gray-600 text-center">
                {mode === "login"
                  ? "Sign in to your account"
                  : "Create a new account"}
              </Text>
            </View>

            <View className="w-full">
              {mode === "register" && (
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  error={errors.name}
                />
              )}

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />

              <Button
                title={mode === "login" ? "Sign In" : "Create Account"}
                onPress={handleSubmit}
                isLoading={isLoading}
              />

              <TouchableOpacity
                onPress={toggleMode}
                className="mt-4 items-center"
              >
                <Text className="text-amber-500">
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
