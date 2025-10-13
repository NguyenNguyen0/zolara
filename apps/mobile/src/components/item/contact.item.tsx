import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@/src/hooks/useTheme';

interface ContactItemProps {
  img?: string;
  name: string;
  email: string;
  onPress?: () => void;
}

export default function ContactItem({ img, name, email, onPress }: ContactItemProps) {
  const { isDark } = useTheme();

  return (
    <View className="border-b border-gray-200 dark:border-gray-700">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View className="py-3.5 flex-row items-center justify-start">
          {img ? (
            <Image
              source={{ uri: img }}
              className="w-10 h-10 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-xl bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
              <Text className="text-lg font-bold text-white">
                {name[0]?.toUpperCase()}
              </Text>
            </View>
          )}

          <View className="flex-1 ml-3">
            <Text className={`text-base font-semibold text-gray-900 ${isDark ? "text-light-mode" : "text-dark-mode"}`} numberOfLines={1}>
							{name}
						</Text>
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {email}
            </Text>
          </View>

          <View className="pr-4">
            <FeatherIcon
              name="chevron-right"
              size={20}
              color="#9ca3af"
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}