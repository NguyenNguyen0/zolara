import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import type { VideoMessageProps } from "@/types";

export const VideoMessage: React.FC<VideoMessageProps> = ({ url }) => {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isLoaded, setIsLoaded] = useState(false);

  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    // Listen for source load event which contains video tracks information
    const subscription = player.addListener("sourceLoad", (payload) => {
      if (payload.availableVideoTracks?.length > 0) {
        const videoTrack = payload.availableVideoTracks[0];
        if (videoTrack.size?.width && videoTrack.size?.height) {
          setAspectRatio(videoTrack.size.width / videoTrack.size.height);
          setIsLoaded(true);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <>
      <TouchableOpacity style={styles.container}>
        <VideoView
          player={player}
          style={[styles.video, { aspectRatio }]}
          contentFit="contain"
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 4,
    width: "100%",
  },
  video: {
    width: "100%",
  },
});
