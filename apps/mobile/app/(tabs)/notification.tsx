
import React from 'react';
import { View, Text, SafeAreaView, StatusBar } from 'react-native';

export default function Notification() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-gray-500 text-center">
          Notifications will appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}
