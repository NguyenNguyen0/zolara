import { Tabs } from "expo-router";
import React, { useState } from "react";
import clsx from "clsx";
import { Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchHeader from "@/components/ui/search-header/SearchHeader";
import { Colors } from "@/constants/Colors";
import PlusMenu from "@/components/ui/plus-menu/PlusMenu";
import { AntDesign, Feather, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  return (
    <>
      <PlusMenu
        visible={showPlusMenu}
        onClose={() => setShowPlusMenu(false)}
        position={{ top: insets.top + 50, right: 20 }}
      />
      <Tabs
        screenOptions={{
          header: ({ route }) => {
            return (
              <SearchHeader
                screenName={route.name as any}
                onActionPress={() => {
                  if (route.name === "index") {
                    setShowPlusMenu(true);
                  }
                }}
                onSearch={() => {}}
              />
            );
          },
          tabBarActiveTintColor: Colors.light.PRIMARY,
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 500,
            display: "none",
          },
          tabBarStyle: {
            backgroundColor: "white",
            height: Platform.select({
              ios: 60 + insets.bottom,
              android: 60 + insets.bottom,
            }),
            paddingTop: 10,
            paddingBottom: Platform.select({
              ios: insets.bottom > 0 ? insets.bottom : 10,
              android: insets.bottom > 0 ? insets.bottom : 10,
            }),
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Tin nhắn",
            tabBarIcon: ({ color, focused }) => (
              <View className={clsx("items-center gap-1", focused ? "" : "")}>
                <AntDesign name="message" size={25} color={focused ? Colors.light.PRIMARY : color} />
                <Text
                  style={{
                    fontSize: 12,
                    color: focused ? Colors.light.PRIMARY : color,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Tin nhắn
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: "Danh bạ",
            tabBarIcon: ({ color, focused }) => (
              <View className={clsx("items-center gap-1", focused ? "" : "")}>
                <FontAwesome6 name="contact-book" size={25} color={focused ? Colors.light.PRIMARY : color} />
                <Text
                  style={{
                    fontSize: 12,
                    color: focused ? Colors.light.PRIMARY : color,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Danh bạ
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: "Khám Phá",
            tabBarIcon: ({ color, focused }) => (
              <View className={clsx("items-center gap-1", focused ? "" : "")}>
                <Ionicons name="compass-outline" size={25} color={focused ? Colors.light.PRIMARY : color} />
                <Text
                  style={{
                    fontSize: 12,
                    color: focused ? Colors.light.PRIMARY : color,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Khám Phá
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: "Bản tin",
            tabBarIcon: ({ color, focused }) => (
              <View className={clsx("items-center gap-1", focused ? "" : "")}>
                <MaterialIcons name="photo-camera-back" size={25} color={focused ? Colors.light.PRIMARY : color} />
                <Text
                  style={{
                    fontSize: 12,
                    color: focused ? Colors.light.PRIMARY : color,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Bản tin
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: "Tôi",
            tabBarIcon: ({ color, focused }) => (
              <View className={clsx("items-center gap-1", focused ? "" : "")}>
                <Feather name="user" size={25} color={focused ? Colors.light.PRIMARY : color} />
                <Text
                  style={{
                    fontSize: 12,
                    color: focused ? Colors.light.PRIMARY : color,
                    fontWeight: 600,
                  }}
                  className="w-20 text-center "
                >
                  Tôi
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
