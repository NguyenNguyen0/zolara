import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { X, Image as ImageIcon, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { MediaPreview } from "@/components/chat/media.preview";
import * as ImagePicker from "expo-image-picker";
import { postService } from "@/services/post-service";
import { useAuthStore } from "@/store/authStore";

import { Post } from "@/services/post-service";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  editPost?: Post | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onPostCreated,
  editPost,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<
    Array<{
      uri: string;
      type: "IMAGE" | "VIDEO";
      width?: number;
      height?: number;
      isExisting?: boolean; // Flag to indicate existing media from post
    }>
  >([]);
  const [privacyLevel, setPrivacyLevel] = useState<"public" | "friends" | "private">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editPost;

  // Load post data when editing
  React.useEffect(() => {
    if (editPost) {
      setContent(editPost.content || "");
      setPrivacyLevel((editPost.privacyLevel as "public" | "friends" | "private") || "public");
      
      // Parse existing media
      if (editPost.media) {
        try {
          const media = typeof editPost.media === "string" 
            ? JSON.parse(editPost.media) 
            : editPost.media;
          if (Array.isArray(media)) {
            setSelectedMedia(
              media.map((item: any) => ({
                uri: item.url,
                type: (item.type === "image" || item.type === "IMAGE") ? "IMAGE" : "VIDEO",
                isExisting: true,
              }))
            );
          }
        } catch (error) {
          console.error("Error parsing media:", error);
          setSelectedMedia([]);
        }
      } else {
        setSelectedMedia([]);
      }
    } else {
      // Reset when creating new post
      setContent("");
      setSelectedMedia([]);
      setPrivacyLevel("public");
    }
  }, [editPost, visible]);

  const handleMediaUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets.length > 0) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        const invalidFiles = result.assets.filter(
          (asset) => asset.fileSize && asset.fileSize > MAX_FILE_SIZE,
        );

        if (invalidFiles.length > 0) {
          Alert.alert("File quá lớn", "Ảnh hoặc video phải nhỏ hơn 10MB.");
          return;
        }

        setSelectedMedia(
          result.assets.map((asset) => ({
            uri: asset.uri,
            type: asset.type === "video" ? "VIDEO" : "IMAGE",
            width: asset.width,
            height: asset.height,
          })),
        );
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
      console.error("Media picker error:", error);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
  };

  const handleAddMedia = async () => {
    await handleMediaUpload();
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung hoặc chọn ảnh/video.");
      return;
    }

    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để đăng bài.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add content
      if (content.trim()) {
        formData.append("content", content.trim());
      }

      // Add privacy level
      formData.append("privacyLevel", privacyLevel);

      // Prepare media array for API
      const mediaArray: any[] = [];
      
      // Add existing media (from post) - only those still selected
      selectedMedia.forEach((media) => {
        if (media.isExisting) {
          mediaArray.push({
            url: media.uri,
            type: media.type === "IMAGE" ? "image" : "video",
          });
        }
      });

      // Add new files
      selectedMedia.forEach((media, index) => {
        if (!media.isExisting) {
          const fileUri = media.uri;
          const fileName = fileUri.split("/").pop() || `file_${index}.jpg`;
          const fileType = media.type === "VIDEO" ? "video/mp4" : "image/jpeg";

          formData.append("files", {
            uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
            name: fileName,
            type: fileType,
          } as any);
        }
      });

      // When editing, always send media field (even if empty array to remove all media)
      // This ensures backend knows to update the media field
      if (isEditMode) {
        // Combine existing media (from mediaArray) with new files (will be added by backend)
        // For now, just send existing media that user kept
        // New files will be uploaded and added by backend
        formData.append("media", JSON.stringify(mediaArray));
      }

      if (isEditMode && editPost) {
        await postService.updatePost(editPost.id, formData);
      } else {
        await postService.createPost(formData);
      }
      
      // Reset form
      setContent("");
      setSelectedMedia([]);
      setPrivacyLevel("public");
      
      onPostCreated?.();
      onClose();
      
      Alert.alert("Thành công", "Đã đăng bài thành công!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể đăng bài. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
          }}
        >
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <X size={24} color={Colors.light.PRIMARY_600} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}>
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || (!content.trim() && selectedMedia.length === 0)}
            style={{
              opacity:
                isSubmitting || (!content.trim() && selectedMedia.length === 0)
                  ? 0.5
                  : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.light.PRIMARY} />
            ) : (
              <Send size={24} color={Colors.light.PRIMARY} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Privacy Selector */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {(["public", "friends", "private"] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setPrivacyLevel(level)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor:
                    privacyLevel === level
                      ? Colors.light.PRIMARY_100
                      : "#F3F4F6",
                  borderWidth: 1,
                  borderColor:
                    privacyLevel === level
                      ? Colors.light.PRIMARY
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      privacyLevel === level
                        ? Colors.light.PRIMARY
                        : "#6B7280",
                    fontWeight: privacyLevel === level ? "600" : "400",
                  }}
                >
                  {level === "public"
                    ? "Công khai"
                    : level === "friends"
                      ? "Bạn bè"
                      : "Riêng tư"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input */}
          <TextInput
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#9CA3AF"
            value={content}
            onChangeText={setContent}
            multiline
            style={{
              fontSize: 16,
              color: "#1F2937",
              minHeight: 100,
              textAlignVertical: "top",
            }}
          />

          {/* Media Preview */}
          {selectedMedia.length > 0 && (
            <MediaPreview
              mediaItems={selectedMedia}
              onRemove={handleRemoveMedia}
            />
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
            paddingBottom: insets.bottom + 12,
          }}
        >
          <TouchableOpacity
            onPress={handleMediaUpload}
            disabled={isSubmitting}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 8,
            }}
          >
            <ImageIcon size={24} color={Colors.light.PRIMARY} />
            <Text style={{ color: Colors.light.PRIMARY, fontSize: 14 }}>
              Ảnh/Video
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

