import React, { useState } from "react";
import { View, TouchableOpacity, Platform, Text, Alert } from "react-native";
import {
  Search,
  Plus,
  Settings,
  UserPlus,
  ImagePlus,
  QrCode,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import SearchModal from "./SearchModal";
type SearchHeaderProps = {
  screenName: "index" | "contacts" | "notifications" | "news" | "info";
  onSearch?: (text: string) => void;
  onActionPress?: () => void;
};

export default function SearchHeader({
  screenName,
  onSearch,
  onActionPress,
}: SearchHeaderProps) {
  const insets = useSafeAreaInsets();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const renderActionIcons = () => {
    switch (screenName) {
      case "index":
        return (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/(screens)/(user)/chatbot" as any)}
              className="mr-4"
            >
              <Sparkles size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onActionPress} className="mr-4">
              <Plus size={28} color="white" />
            </TouchableOpacity>
          </View>
        );
      case "contacts":
        return (
          <TouchableOpacity
            onPress={() => router.push("/(screens)/(user)/friend/search-user" as any)}
            className="mr-4"
          >
            <UserPlus size={25} color="white" />
          </TouchableOpacity>
        );
      case "notifications":
        return (
          <TouchableOpacity onPress={onActionPress} className="mr-4">
          </TouchableOpacity>
        );
      case "news":
        return (
          <TouchableOpacity onPress={onActionPress} className="mr-4">
          </TouchableOpacity>
        );
      case "info":
        return (
          <TouchableOpacity
            onPress={() => router.push("/(screens)/(user)/settings" as any)}
            className="mr-4"
          >
            <Settings size={25} color="white" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      start={{ x: 0.03, y: 0 }}
      end={{ x: 0.99, y: 2.5 }}
      colors={Colors.light.GRADIENT as any}
    >
      <View
        className="flex-row items-center justify-between "
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 10,
        }}
      >
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => setIsSearchModalVisible(true)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Search size={23} color="white" />
            <Text className="pl-6 text-xl text-white opacity-60">Tìm kiếm</Text>
          </TouchableOpacity>

          {/* Search Modal */}
          <SearchModal
            isVisible={isSearchModalVisible}
            onClose={() => setIsSearchModalVisible(false)}
          />
        </View>
        {renderActionIcons()}
      </View>
    </LinearGradient>
  );
}
