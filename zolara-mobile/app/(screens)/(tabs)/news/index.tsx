import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Plus } from "lucide-react-native";
import { PostItem } from "@/components/post/post.item";
import { CreatePostModal } from "@/components/post/create-post.modal";
import { CommentModal } from "@/components/post/comment.modal";
import { postService, Post } from "@/services/post-service";

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const loadPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await postService.getFeedPosts(pageNum, 20);
      if (append) {
        setPosts((prev) => [...prev, ...response.data]);
      } else {
        setPosts(response.data);
      }
      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (error: any) {
      console.error("Error loading posts:", error);
      Alert.alert("Lỗi", "Không thể tải bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setPage(1);
      loadPosts(1, false);
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadPosts(1, false);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const handlePostCreated = () => {
    // Refresh posts after creating/updating
    setPage(1);
    loadPosts(1, false);
    setEditPost(null);
  };

  const handleEditPost = (post: Post) => {
    setEditPost(post);
    setShowCreateModal(true);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      "Xóa bài viết",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await postService.deletePost(postId);
              Alert.alert("Thành công", "Đã xóa bài viết thành công!");
              handlePostCreated();
            } catch (error: any) {
              console.error("Error deleting post:", error);
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể xóa bài viết. Vui lòng thử lại.",
              );
            }
          },
        },
      ],
    );
  };

  const handleLikePost = async (postId: string) => {
    try {
      await postService.toggleLikePost(postId);
      // Refresh posts to update like status
      handlePostCreated();
    } catch (error: any) {
      console.error("Error toggling like:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể thích bài viết. Vui lòng thử lại.",
      );
    }
  };

  const handleCommentPost = (postId: string) => {
    setSelectedPostId(postId);
    setShowCommentModal(true);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={handleLikePost}
      onComment={handleCommentPost}
      onEdit={handleEditPost}
      onDelete={handleDeletePost}
    />
  );

  if (loading && posts.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.PRIMARY]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && posts.length > 0 ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator size="small" color={Colors.light.PRIMARY} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
                Chưa có bài viết nào
              </Text>
            </View>
          ) : null
        }
      />

      {/* Create Post Button - Fixed at bottom right */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 16,
          zIndex: 10,
          backgroundColor: Colors.light.PRIMARY,
          borderRadius: 28,
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditPost(null);
        }}
        onPostCreated={handlePostCreated}
        editPost={editPost}
      />

      <CommentModal
        visible={showCommentModal}
        postId={selectedPostId || ""}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedPostId(null);
        }}
        onCommentAdded={() => {
          handlePostCreated();
        }}
      />
    </View>
  );
}
