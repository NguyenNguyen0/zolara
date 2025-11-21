import React from "react";
import {
  FlatList,
  ListRenderItem,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import ChatItem from "./ChatItem";
import { Conversation, ConversationListProps } from "@/types";
import { Colors } from "@/constants/Colors";

interface ConversationListComponentProps extends ConversationListProps {
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
}

const ConversationList: React.FC<ConversationListComponentProps> = ({
  conversations,
  onConversationPress,
  loading = false,
  error = null,
  onRefresh,
  refreshing = false,
  onEndReached,
}) => {
  const renderItem: ListRenderItem<Conversation> = ({ item }) => (
    <ChatItem conversation={item} onPress={onConversationPress} />
  );

  const keyExtractor = (item: Conversation) => item.id;

  if (loading && conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
        <Text className="text-gray-500 mt-2">Đang tải cuộc trò chuyện...</Text>
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-red-500">{error}</Text>
        {onRefresh && (
          <View
            className="mt-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: Colors.light.PRIMARY_50 }}
          >
            <Text
              style={{ color: Colors.light.PRIMARY_500 }}
              onPress={onRefresh}
            >
              Thử lại
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-gray-500">Chưa có cuộc trò chuyện nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.PRIMARY]}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

export default ConversationList;
