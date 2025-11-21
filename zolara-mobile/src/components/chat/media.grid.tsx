import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text as RNText,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

const { width: screenWidth } = Dimensions.get("window");

interface MediaGridProps {
  mediaItems: Array<{ type: string; url: string }>;
  onImagePress: (index: number) => void;
  maxGridWidth?: number;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaItems,
  onImagePress,
  maxGridWidth = Math.min(screenWidth * 0.6, 300),
}) => {
  // Filter image items only
  const imageItems = mediaItems.filter((media) => media.type === "IMAGE");

  if (imageItems.length === 0) return null;

  const getImageStyle = (index: number, total: number) => {
    const itemWidth = (maxGridWidth - 8) / 2;
    const largeImageHeight = maxGridWidth * 0.6;
    const smallImageHeight = maxGridWidth * 0.4;

    switch (total) {
      case 1:
        return {
          width: maxGridWidth,
          height: maxGridWidth * 0.5625,
          borderRadius: 8,
        };
      case 2:
        return {
          width: itemWidth,
          height: itemWidth,
          borderRadius: 8,
        };
      case 3:
        if (index === 0) {
          return {
            width: maxGridWidth,
            height: largeImageHeight,
            borderRadius: 8,
          };
        } else if (index === 1) {
          return {
            width: itemWidth,
            height: smallImageHeight,
            marginRight: 1,
            borderRadius: 8,
          };
        }
        return {
          width: itemWidth,
          height: smallImageHeight,
          borderRadius: 8,
          marginLeft: 1,
        };
      default:
        return {
          width: itemWidth,
          height: itemWidth,
          borderRadius: 8,
        };
    }
  };

  // Limit to 4 items, show +N for extra
  const displayItems = imageItems.slice(0, 4);
  const extraCount = imageItems.length > 4 ? imageItems.length - 4 : 0;

  return (
    <View style={[styles.imageGrid, { width: maxGridWidth }]}>
      {displayItems.map((media, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => onImagePress(idx)}
          style={[
            styles.gridItemContainer,
            getImageStyle(idx, Math.min(imageItems.length, 4)),
            idx % 2 === 0 ? { marginRight: 3 } : { marginLeft: 3 },
            idx < 2 && imageItems.length >= 3 ? { marginBottom: 3 } : null,
          ]}
        >
          <View className="flex">
            <Image
              source={media.url}
              style={styles.gridImage}
              contentFit="cover"
            />
            {extraCount > 0 && idx === 3 && (
              <View style={styles.overlay}>
                <RNText style={styles.overlayText}>+{extraCount}</RNText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    justifyContent: "flex-start",
  },
  gridItemContainer: {
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
