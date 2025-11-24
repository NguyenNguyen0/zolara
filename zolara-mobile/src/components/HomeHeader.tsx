import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Search, QrCode, UserPlus } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  onSearchChange?: (query: string) => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearchChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: Colors.light.PRIMARY,
      }}
    >
      <View className="px-4 py-3">
        <View className="flex-row items-center">
          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-white rounded-full px-4 py-2.5">
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-700"
              placeholder="Tìm kiếm bạn bè..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>

          {/* QR Code Button */}
          <TouchableOpacity
            className="ml-3 p-2.5 bg-white/20 rounded-full"
            onPress={() => router.push("/(screens)/(user)/friend/qr" as any)}
          >
            <QrCode size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Add Friend Button */}
          <TouchableOpacity
            className="ml-2 p-2.5 bg-white/20 rounded-full"
            onPress={() =>
              router.push("/(screens)/(user)/friend/search-user" as any)
            }
          >
            <UserPlus size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
