import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { Heart, MessageCircle, Edit, Trash2, Globe, Users, Lock } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { Post } from "@/services/post-service";
import { MediaGrid } from "@/components/chat/media.grid";
import { ImageViewer } from "@/components/chat/image.viewer";
import { useAuthStore } from "@/store/authStore";
// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "vừa xong";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
    return date.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

const { width: screenWidth } = Dimensions.get("window");

interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onPress?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onPress,
  onEdit,
  onDelete,
}) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.reactions || 0);
  const { user } = useAuthStore();
  const isOwner = user?.userId === post.userId;

  // Check if current user has liked this post
  React.useEffect(() => {
    if (user?.userId && post.reactions) {
      const userReaction = post.reactions.find(
        (r) => r.userId === user.userId && r.reactionType === "LIKE",
      );
      setIsLiked(!!userReaction);
    }
    setLikeCount(post._count.reactions || 0);
  }, [post.reactions, post._count.reactions, user?.userId]);

  const handleLike = async () => {
    if (!onLike) return;
    
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));
    
    try {
      await onLike(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(post._count.reactions || 0);
    }
  };

  // Parse media from JSON
  const mediaItems = React.useMemo(() => {
    if (!post.media) return [];
    try {
      const media = typeof post.media === "string" ? JSON.parse(post.media) : post.media;
      if (Array.isArray(media)) {
        return media.map((item: any) => ({
          type: item.type === "image" ? "IMAGE" : "VIDEO",
          url: item.url,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [post.media]);

  // Filter only images for grid
  const imageItems = mediaItems.filter((item) => item.type === "IMAGE");

  // Get privacy level icon and text
  const getPrivacyInfo = (privacyLevel: string) => {
    switch (privacyLevel) {
      case "public":
        return { icon: Globe, text: "Công khai", color: "#10B981" };
      case "friends":
        return { icon: Users, text: "Bạn bè", color: "#3B82F6" };
      case "private":
        return { icon: Lock, text: "Chỉ mình tôi", color: "#6B7280" };
      default:
        return { icon: Globe, text: "Công khai", color: "#10B981" };
    }
  };

  const privacyInfo = getPrivacyInfo(post.privacyLevel || "public");
  const PrivacyIcon = privacyInfo.icon;

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onPress?.(post.id)}
        >
          <Avatar size="sm" className="mr-2">
            {post.user?.userInfo?.profilePictureUrl ? (
              <AvatarImage
                source={{ uri: post.user.userInfo.profilePictureUrl }}
              />
            ) : (
              <AvatarFallbackText>
                {post.user?.userInfo?.fullName || "User"}
              </AvatarFallbackText>
            )}
          </Avatar>
          <View>
            <Text style={styles.userName}>
              {post.user?.userInfo?.fullName || "Unknown User"}
            </Text>
            <View style={styles.timeAndPrivacy}>
              <Text style={styles.timeAgo}>
                {formatDate(post.createdAt)}
              </Text>
              <View style={styles.privacyContainer}>
                <PrivacyIcon size={12} color={privacyInfo.color} />
                <Text style={[styles.privacyText, { color: privacyInfo.color }]}>
                  {privacyInfo.text}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {isOwner && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => onEdit?.(post)}
              style={styles.actionIconButton}
            >
              <Edit size={18} color={Colors.light.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(post.id)}
              style={styles.actionIconButton}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {post.content && (
        <Text style={styles.content}>{post.content}</Text>
      )}

      {/* Media Grid - Only images */}
      {imageItems.length > 0 && (
        <View style={styles.mediaContainer}>
          <MediaGrid
            mediaItems={imageItems}
            onImagePress={handleImagePress}
            maxGridWidth={screenWidth - 32}
          />
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        {likeCount > 0 && (
          <Text style={styles.statsText}>
            {likeCount} lượt thích
          </Text>
        )}
        {post._count.comments > 0 && (
          <Text style={styles.statsText}>
            {post._count.comments} bình luận
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Heart
            size={20}
            color={isLiked ? Colors.light.PRIMARY : Colors.light.GRAY_600}
            fill={isLiked ? Colors.light.PRIMARY : "none"}
          />
          <Text
            style={[
              styles.actionText,
              isLiked && { color: Colors.light.PRIMARY },
            ]}
          >
            Thích
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
        >
          <MessageCircle size={20} color={Colors.light.GRAY_600} />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      {showImageViewer && imageItems.length > 0 && (
        <ImageViewer
          images={imageItems.map((item) => item.url)}
          initialIndex={selectedImageIndex}
          visible={showImageViewer}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  timeAndPrivacy: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: "500",
  },
  content: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statsText: {
    fontSize: 13,
    color: "#6B7280",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  actionIconButton: {
    padding: 4,
  },
});

