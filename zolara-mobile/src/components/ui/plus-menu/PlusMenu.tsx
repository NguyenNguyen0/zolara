import React from "react";
import {
  View,
  Pressable,
  Modal,
  Text,
} from "react-native";
import {
  UserRoundPlus,
  Users,
  QrCode,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

interface PlusMenuProps {
  visible: boolean;
  onClose: () => void;
  position?: { top: number; right: number };
}

const PlusMenu: React.FC<PlusMenuProps> = ({
  visible,
  onClose,
  position = { top: 60, right: 20 },
}) => {
  const menuItems = [
    {
      id: "add-friend",
      icon: <UserRoundPlus size={24} color={Colors.light.PRIMARY} />,
      title: "Thêm bạn",
      onPress: () => {
        onClose();
        router.push("/(screens)/(user)/friend/search-user" as any);
      },
    },
    {
      id: "create-group",
      icon: <Users size={24} color={Colors.light.PRIMARY} />,
      title: "Tạo nhóm",
      onPress: () => {
        onClose();
        router.push("/(screens)/(user)/group/create" as any);
      },
    },
    {
      id: "qr-friend",
      icon: <QrCode size={24} color={Colors.light.PRIMARY} />,
      title: "Kết bạn QR",
      onPress: () => {
        onClose();
        router.push("/(screens)/(user)/friend/qr" as any);
      },
    },
    {
      id: "qr-group",
      icon: <QrCode size={24} color={Colors.light.PRIMARY} />,
      title: "Tham gia nhóm QR",
      onPress: () => {
        onClose();
        router.navigate("/(screens)/(user)/group/qr" as any);
      },
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1"
        onPress={onClose}
      >
        <View
          className="absolute bg-white rounded-xl shadow-lg overflow-hidden"
          style={{
            top: position.top,
            right: position.right,
            width: 220,
            paddingVertical: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 10,
          }}
          onStartShouldSetResponder={() => true}
        >
          {menuItems.map((item) => {
            return (
              <Pressable
                key={item.id}
                className="flex-row items-center py-3 px-4 active:bg-gray-100"
                onPress={item.onPress}
              >
                <View className="mr-3">{item.icon}</View>
                <Text className="text-base text-gray-800 font-medium">
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
};

export default PlusMenu;
