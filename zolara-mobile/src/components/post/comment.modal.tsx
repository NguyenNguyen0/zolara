import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { postService, Comment } from "@/services/post-service";
import { useAuthStore } from "@/store/authStore";

interface CommentModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  postId,
  onClose,
  onCommentAdded,
}) => {
  const insets = useSafeAreaInsets();
  const { user, userInfo } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadComments = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!postId) return;
      try {
        setIsLoading(true);
        const response = await postService.getPostComments(postId, pageNum, 20);
        if (append) {
          setComments((prev) => [...prev, ...response.data]);
        } else {
          setComments(response.data);
        }
        setHasMore(response.pagination.page < response.pagination.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    if (visible && postId) {
      loadComments(1, false);
    }
  }, [visible, postId, loadComments]);

  const handleSubmit = async () => {
    if (!commentText.trim() || !postId) return;

    setIsSubmitting(true);
    try {
      await postService.createComment(postId, commentText.trim());
      setCommentText("");
      // Reload comments
      await loadComments(1, false);
      onCommentAdded?.();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading) return;
    loadComments(page + 1, true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}>
              Bình luận
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.light.PRIMARY_600} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            onScroll={({ nativeEvent }) => {
              if (
                nativeEvent.layoutMeasurement.height +
                  nativeEvent.contentOffset.y >=
                nativeEvent.contentSize.height - 20
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {isLoading && comments.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
              </View>
            ) : comments.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
                  Chưa có bình luận nào
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View
                  key={comment.id}
                  style={{
                    flexDirection: "row",
                    marginBottom: 16,
                  }}
                >
                  <Avatar size="sm" className="mr-3">
                    {comment.user?.userInfo?.profilePictureUrl ? (
                      <AvatarImage
                        source={{ uri: comment.user.userInfo.profilePictureUrl }}
                      />
                    ) : (
                      <AvatarFallbackText>
                        {comment.user?.userInfo?.fullName || "User"}
                      </AvatarFallbackText>
                    )}
                  </Avatar>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#1F2937",
                          marginBottom: 4,
                        }}
                      >
                        {comment.user?.userInfo?.fullName || "Unknown User"}
                      </Text>
                      <Text style={{ fontSize: 15, color: "#1F2937" }}>
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            {isLoading && comments.length > 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={Colors.light.PRIMARY} />
              </View>
            )}
          </ScrollView>

          {/* Input Section */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#F0F0F0",
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: "#FFFFFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar size="sm">
                {userInfo?.profilePictureUrl ? (
                  <AvatarImage
                    source={{ uri: userInfo.profilePictureUrl }}
                  />
                ) : (
                  <AvatarFallbackText>
                    {userInfo?.fullName || "User"}
                  </AvatarFallbackText>
                )}
              </Avatar>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 15,
                  color: "#1F2937",
                }}
                placeholder="Viết bình luận..."
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!commentText.trim() || isSubmitting}
                style={{
                  opacity: !commentText.trim() || isSubmitting ? 0.5 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.light.PRIMARY}
                  />
                ) : (
                  <Send size={24} color={Colors.light.PRIMARY} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

