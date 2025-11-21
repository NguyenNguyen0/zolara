import React from "react";
import ImageView from "react-native-image-viewing";
import type { ImageViewerProps } from "@/types";

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  visible,
  onClose,
  initialIndex = 0,
}) => {
  return (
    <ImageView
      images={images.map((url) => ({ uri: url }))}
      imageIndex={initialIndex}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
};
