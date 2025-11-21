import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { Mic, X, Send } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface VoiceRecorderProps {
  onClose: () => void;
  onSend: (uri: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onClose, onSend }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const pulseAnim = new Animated.Value(1);

  // Start the pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access microphone was denied");
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and prepare recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        setAudioUri(uri);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (err) {
        console.error("Failed to stop recording", err);
      }
    }
    setRecording(null);
    setIsRecording(false);
    setRecordingDuration(0);
    setAudioUri(null);
    onClose();
  };

  const handleSend = () => {
    if (audioUri) {
      onSend(audioUri);
      setAudioUri(null);
      setRecordingDuration(0);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelRecording} style={styles.closeButton}>
          <X size={24} color={Colors.light.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isRecording
            ? "Recording..."
            : audioUri
              ? "Ready to send"
              : "Tap to record"}
        </Text>
      </View>

      <View style={styles.recordingContainer}>
        {isRecording ? (
          <View style={styles.recordingInfo}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.timer}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>
        ) : audioUri ? (
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingComplete}>Recording complete</Text>
            <Text style={styles.timer}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>
        ) : null}

        <View style={styles.controls}>
          {!audioUri ? (
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.recordButton,
                isRecording ? styles.recordingActive : null,
              ]}
            >
              <Mic size={28} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={cancelRecording}
                style={styles.cancelButton}
              >
                <X size={24} color={"red"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Send size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.PRIMARY,
    marginRight: 40, // To balance the close button
  },
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  recordingInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  recordingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "red",
    marginBottom: 8,
  },
  timer: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.PRIMARY,
  },
  recordingComplete: {
    fontSize: 16,
    color: Colors.light.PRIMARY,
    marginBottom: 8,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingActive: {
    backgroundColor: "red",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cancelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VoiceRecorder;
