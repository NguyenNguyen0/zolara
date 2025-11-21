import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";

interface MediaPreviewProps {
  mediaItems: Array<{
    uri: string;
    type: "IMAGE" | "VIDEO";
    width?: number;
    height?: number;
  }>;
  onRemove: (index: number) => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaItems,
  onRemove,
}) => {
  if (mediaItems.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {mediaItems.map((media, index) => (
        <View key={index} style={styles.previewItem}>
          <Image
            source={media.uri}
            style={styles.previewImage}
            contentFit="cover"
          />
          <TouchableOpacity
            className="absolute top-0.5 right-0.5  rounded-md p-1"
            onPress={() => onRemove(index)}
          >
            <X size={18} color="#c4c4c4" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  previewItem: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});
