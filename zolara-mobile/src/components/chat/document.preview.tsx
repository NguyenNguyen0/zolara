import React from "react";
import {
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { FileText } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { DocumentPreviewProps } from "@/types";

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  fileName,
}) => {
  const handleOpenDocument = async () => {
    try {
      // Kiểm tra nếu là local file
      if (url.startsWith("file://")) {
        await Sharing.shareAsync(url);
        return;
      }

      // Download file từ remote URL
      const filename = url.split("/").pop() || "document";
      const localUri = `${(FileSystem as any).cacheDirectory}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          // Có thể thêm progress indicator ở đây
        },
      );

      const result = await downloadResumable.downloadAsync();
      const uri = result?.uri;
      if (uri) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Error opening document:", error);
      Alert.alert("Error", "Cannot open document");
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleOpenDocument}>
      <View style={styles.content}>
        <FileText size={24} color="#666" strokeWidth={1.5} />
        {/* <Text style={styles.fileName} numberOfLines={1}>
          {url.split("/").pop()}
        </Text> */}
        <Text className="text-base text-gray-400 pr-10" numberOfLines={1}>
          {fileName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
});
