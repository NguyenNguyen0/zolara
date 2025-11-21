import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useUserStatusStore } from "@/store/userStatusStore";
import { Colors } from "@/constants/Colors";

interface UserStatusIndicatorProps {
  userId: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  userId,
  showText = false,
  size = "md",
  className = "",
  textClassName = "",
}) => {
  const isOnline = useUserStatusStore((state) => state.isUserOnline(userId));
  const isTyping = useUserStatusStore((state) => state.isUserTyping(userId));
  const userStatus = useUserStatusStore((state) => state.getUserStatus(userId));
  const lastActivity = useUserStatusStore((state) =>
    state.getLastActivity(userId),
  );

  // Yêu cầu cập nhật trạng thái khi component được mount
  useEffect(() => {
    useUserStatusStore.getState().requestStatusUpdate([userId]);
  }, [userId]);

  // Xác định kích thước của chỉ báo
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-2 h-2";
      case "lg":
        return "w-4 h-4";
      case "md":
      default:
        return "w-3 h-3";
    }
  };

  // Xác định màu sắc dựa trên trạng thái
  const getStatusColor = () => {
    if (isTyping) return Colors.light.PRIMARY_500;
    return isOnline ? "#10B981" : "#9CA3AF"; // green-500 : gray-400
  };

  // Định dạng thời gian hoạt động cuối cùng
  const formatLastSeen = (lastSeenDate?: Date) => {
    if (!lastSeenDate) return "Không xác định";

    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 1) return "Vừa mới truy cập";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return lastSeenDate.toLocaleDateString();
  };

  // Xác định văn bản trạng thái
  const getStatusText = () => {
    if (isTyping) return "Đang nhập...";
    if (isOnline) return "Đang hoạt động";
    if (lastActivity) return `Hoạt động ${formatLastSeen(lastActivity)}`;
    return "Không hoạt động";
  };

  return (
    <View className={`flex-row items-center ${className}`}>
      <View
        className={`${getSizeClass()} rounded-full mr-1`}
        style={{ backgroundColor: getStatusColor() }}
      />
      {showText && (
        <Text
          className={`text-xs ${isOnline ? "text-green-700" : "text-gray-600"} ${textClassName}`}
        >
          {getStatusText()}
        </Text>
      )}
    </View>
  );
};

export default UserStatusIndicator;
