import { View, ActivityIndicator } from "react-native";

interface IProps {}

const LoadingOverlay = (props: IProps) => {
  return (
    <View className="absolute inset-0 items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingOverlay;
