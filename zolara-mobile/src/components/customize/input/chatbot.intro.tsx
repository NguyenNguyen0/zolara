import React from "react";
import { View, Text, Image } from "react-native";
import { Colors } from "@/constants/Colors";

interface ChatbotIntroProps {
  assistantName?: string;
  assistantAvatar?: string;
}

export default function ChatbotIntro({
  assistantName = "Zolara Assistant",
  assistantAvatar = "https://bpvhtgzjpccsngxhiugw.supabase.co/storage/v1/object/public/system/system/2507031a-c38d-4697-a0e5-cac96629fa99.png"
}: ChatbotIntroProps) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-12">
      {/* Zolara Logo */}
      <View className="mb-8">
        <View style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <Image
            source={{ uri: assistantAvatar }}
            className="w-24 h-24 rounded-full"
          />
        </View>
      </View>

      {/* Welcome Title */}
      <Text className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
        Xin chào! 👋
      </Text>
      
      {/* Assistant Name */}
      <Text 
        className="text-xl font-semibold text-center mb-6"
        style={{ color: Colors.light.PRIMARY }}
      >
        Tôi là {assistantName}
      </Text>

      {/* Call to action */}
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 w-full">
        <Text className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium">
          💡 Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn bên dưới!
        </Text>
      </View>
    </View>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className="flex-row items-start mb-3">
      <Text className="text-xl mr-3 mt-0.5">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
          {title}
        </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400 leading-4">
          {description}
        </Text>
      </View>
    </View>
  );
}