import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface CustomToastRedProps {
  message: string;
  duration?: number;
  onHide?: () => void;
}

const CustomToastRed: React.FC<CustomToastRedProps> = ({
  message,
  duration = 1000, // 1 giây
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Hiệu ứng hiển thị
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Đặt timeout để ẩn toast
    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) {
          onHide();
        }
      });
    }, duration - 400);

    return () => clearTimeout(hideTimer);
  }, [duration, onHide, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <AlertTriangle size={18} color="white" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(220, 38, 38, 0.9)", // Màu đỏ với độ trong suốt
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 6,
  },
  message: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 0.3,
  },
});

export default CustomToastRed;
