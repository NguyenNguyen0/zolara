import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-center mb-4"
      activeOpacity={0.7}
    >
      <View
        className={`w-5 h-5 mr-2 items-center justify-center rounded border ${
          checked ? "bg-amber-500 border-amber-500" : "border-gray-400"
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
      <Text className="text-sm text-gray-700">{label}</Text>
    </TouchableOpacity>
  );
};

export default Checkbox;
