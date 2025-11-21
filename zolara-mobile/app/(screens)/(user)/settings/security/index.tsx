import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, KeyRound, Mail, Phone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FunctionButton } from "@/components/ui/function-button";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function AccountSecurityScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        start={{ x: 0.03, y: 0 }}
        end={{ x: 0.99, y: 2.5 }}
        colors={Colors.light.GRADIENT as any}
        style={{
          paddingTop: insets.top,
          paddingBottom: 10,
        }}
      >
        <View className="flex-row bg-transparent items-center px-4 pt-2 pb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={"white"} />
          </TouchableOpacity>
          <Text className="text-lg text-white font-medium ml-4">
            Tài khoản và bảo mật
          </Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1">
        <FunctionButton
          icon={
            <KeyRound
              size={26}
              color={Colors.light.PRIMARY}
              strokeWidth={1.5}
            />
          }
          title="Đổi mật khẩu"
          onPress={() =>
            router.push("/(screens)/(user)/settings/security/change.password" as any)
          }
          showBottomBorder={true}
        />

        <FunctionButton
          icon={
            <Mail
              size={26}
              color={Colors.light.PRIMARY}
              strokeWidth={1.5}
            />
          }
          title="Đổi email"
          onPress={() => router.push("/(screens)/(user)/settings/security/change.email" as any)}
          showBottomBorder={true}
        />

        <FunctionButton
          icon={
            <Phone
              size={26}
              color={Colors.light.PRIMARY}
              strokeWidth={1.5}
            />
          }
          title="Đổi số điện thoại"
          onPress={() => router.push("/(screens)/(user)/settings/security/change.phone" as any)}
        />
      </ScrollView>
    </View>
  );
}
