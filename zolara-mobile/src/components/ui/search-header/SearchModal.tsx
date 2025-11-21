import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import {
  X,
  Search,
  UserPlus,
  MessageSquare,
  ArrowLeft,
} from "lucide-react-native";
import { searchFriends, Friend } from "@/services/friend-service";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isVisible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (isVisible) {
      // Reset state when modal opens
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  }, [isVisible]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const results = await searchFriends(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching friends:", err);
      setError("Không thể tìm kiếm bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendPress = (friend: Friend) => {
    // Navigate to chat with this friend
    router.push({
      pathname: `../chat/${friend.friend.id}`,
      params: {
        name: friend.friend.userInfo.fullName,
        avatarUrl: friend.friend.userInfo.profilePictureUrl,
        type: "USER",
      },
    });
    onClose();
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-200"
      onPress={() => handleFriendPress(item)}
    >
      <Avatar size="md">
        {item.friend.userInfo.profilePictureUrl ? (
          <AvatarImage
            source={{ uri: item.friend.userInfo.profilePictureUrl }}
          />
        ) : (
          <AvatarFallbackText>
            {item.friend.userInfo.fullName}
          </AvatarFallbackText>
        )}
      </Avatar>

      <View className="flex-1 ml-3">
        <Text className="font-medium text-base">
          {item.friend.userInfo.fullName}
        </Text>
        <Text className="text-gray-500 text-sm">{item.friend.phoneNumber}</Text>
      </View>

      <TouchableOpacity
        className="p-2 rounded-full"
        style={{ backgroundColor: Colors.light.MESSAGE_BUBBLE_REACTION }}
        onPress={() => handleFriendPress(item)}
      >
        <Entypo name="chevron-right" size={24} color={Colors.light.PRIMARY} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <LinearGradient
          start={{ x: 0.03, y: 0 }}
          end={{ x: 0.99, y: 2.5 }}
          colors={Colors.light.GRADIENT as any}
        >
          {/* Header */}
          <View
            className="flex-row items-center p-3 border-b border-gray-200"
            style={{ paddingTop: Platform.OS === "ios" ? insets.top : 12 }}
          >
            <TouchableOpacity onPress={onClose} className="mr-3">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center bg-gray-100 rounded-3xl px-3 py-2.5">
              <Search size={20} color="gray" />
              <TextInput
                className="flex-1 ml-2 text-base p-0.5"
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Results */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator
                size="large"
                color={Colors.light.PRIMARY}
              />
              <Text className="mt-2 text-gray-500">Đang tìm kiếm...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-red-500">{error}</Text>
            </View>
          ) : searchResults.length === 0 && searchQuery.trim() !== "" ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">Không tìm thấy kết quả nào</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.friend.id}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SearchModal;
