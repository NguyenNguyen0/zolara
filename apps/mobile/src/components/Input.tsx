import React from "react";
import {
  TextInput,
  Text,
  View,
  TextInputProps
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <View className="mb-4 w-full">
      <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className={`w-full rounded-lg border p-3 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;
