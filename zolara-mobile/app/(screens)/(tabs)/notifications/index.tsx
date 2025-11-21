import { Text, View, Image, Dimensions, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Bell, Sparkles, MessageSquare, UserPlus, Heart } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  
  // Calculate image size - full width minus padding
  const availableHeight = height - insets.top - insets.bottom;
  const horizontalPadding = 48; // px-6 = 24px each side
  const imageWidth = width - horizontalPadding;
  const imageHeight = Math.min(imageWidth, availableHeight * 0.4);
  
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: insets.top > 0 ? 20 : 40,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center w-full">
        {/* Animated GIF */}
        <View>
          <Image
            source={require("@/assets/images/default/404.gif")}
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Main Title */}
        <View className="items-center mb-2">
          <View className="flex-row items-center mb-2">
            <Bell size={32} color={Colors.light.PRIMARY_500} />
            <Text className="text-3xl font-bold text-center text-gray-900 ml-2">
              Thông Báo
            </Text>
          </View>
          <Text className="text-lg font-semibold text-center" style={{ color: Colors.light.PRIMARY_600 }}>
            Tính năng đang phát triển
          </Text>
        </View>

        {/* Description */}
        <Text className="text-base text-gray-600 text-center leading-7 mb-8 px-2">
          Chúng tôi đang xây dựng tính năng Thông Báo để bạn không bỏ lỡ những 
          cập nhật quan trọng từ tin nhắn, bạn bè và hoạt động trong cộng đồng.
        </Text>

        {/* Features Card */}
        <View
          className="rounded-2xl p-6 w-full mb-6"
          style={{ 
            backgroundColor: Colors.light.PRIMARY_50,
            borderWidth: 1,
            borderColor: Colors.light.PRIMARY_100,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Sparkles size={24} color={Colors.light.PRIMARY_500} />
            <Text
              className="text-lg font-bold ml-2"
              style={{ color: Colors.light.PRIMARY_700 }}
            >
              Sắp ra mắt
            </Text>
          </View>
          
          <View>
            <View className="flex-row items-start mb-3">
              <View 
                className="rounded-full p-1.5 mr-3 mt-0.5"
                style={{ backgroundColor: Colors.light.PRIMARY_100 }}
              >
                <MessageSquare size={16} color={Colors.light.PRIMARY_600} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  Thông báo tin nhắn
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Nhận thông báo khi có tin nhắn mới từ bạn bè và nhóm
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-3">
              <View 
                className="rounded-full p-1.5 mr-3 mt-0.5"
                style={{ backgroundColor: Colors.light.PRIMARY_100 }}
              >
                <UserPlus size={16} color={Colors.light.PRIMARY_600} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  Lời mời kết bạn
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Thông báo khi có người gửi lời mời kết bạn hoặc chấp nhận lời mời
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View 
                className="rounded-full p-1.5 mr-3 mt-0.5"
                style={{ backgroundColor: Colors.light.PRIMARY_100 }}
              >
                <Heart size={16} color={Colors.light.PRIMARY_600} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  Tương tác
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Thông báo về reactions, mentions và các hoạt động khác
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coming Soon Badge */}
        <View 
          className="rounded-full px-6 py-3"
          style={{ backgroundColor: Colors.light.PRIMARY_100 }}
        >
          <Text 
            className="text-sm font-semibold"
            style={{ color: Colors.light.PRIMARY_700 }}
          >
            🚀 Sắp có mặt trong phiên bản tiếp theo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
