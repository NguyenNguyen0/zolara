import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Play, Pause, Volume2 } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface AudioMessageProps {
  url: string;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ url }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load the audio file
  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        setIsLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false },
          onPlaybackStatusUpdate,
        );

        if (isMounted) {
          setSound(sound);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading audio:", error);
        setIsLoading(false);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      // Reset when playback finishes
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  // Toggle play/pause
  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      // If at the end, start from beginning
      if (position >= duration - 100) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
    }
  };

  // Format time in seconds to MM:SS
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity onPress={togglePlayback} style={styles.container} activeOpacity={0.7}>
      <View style={styles.contentContainer}>
        <View style={styles.controlsContainer}>
          <View style={styles.controlsContainer}>
            <View style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.1)', 
              borderRadius: 20, 
              padding: 8,
              marginRight: 2 
            }}>
              <Volume2 size={20} color={Colors.light.PRIMARY} strokeWidth={2.5} />
            </View>
            <TouchableOpacity
              onPress={togglePlayback}
              disabled={isLoading}
              style={styles.playButton}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Text style={styles.loadingText}>...</Text>
              ) : isPlaying ? (
                <Pause size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
              ) : (
                <Play size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    alignItems: "center",
    minWidth: 260,
  },
  iconContainer: {
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.light.PRIMARY,
    borderRadius: 3,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: Colors.light.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 10,
    color: "#555",
  },
});

export default AudioMessage;
