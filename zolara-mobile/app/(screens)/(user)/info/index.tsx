import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Ellipsis,
  Image as ImageIcon,
  User,
  Camera,
  Plus,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  updateCoverImage,
  updateProfilePicture,
} from "@/services/user-service";
import { postService, Post } from "@/services/post-service";
import { PostItem } from "@/components/post/post.item";
import { CreatePostModal } from "@/components/post/create-post.modal";
import { CommentModal } from "@/components/post/comment.modal";
import { Colors } from "@/constants/Colors";

export default function UserInfoScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const userInfo = useAuthStore((state) => state.userInfo);
  const [showMenu, setShowMenu] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsRefreshing, setPostsRefreshing] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // fullName nằm trong userInfo, không phải user
  const displayName = userInfo?.fullName || user?.fullName || "Người dùng";

  // Load user posts
  const loadUserPosts = async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.userId) return;
    try {
      setPostsLoading(true);
      const response = await postService.getMyPosts(pageNum, 20);
      if (append) {
        setPosts((prev) => [...prev, ...response.data]);
      } else {
        setPosts(response.data);
      }
      setPostsHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (error: any) {
      console.error("Error loading user posts:", error);
    } finally {
      setPostsLoading(false);
      setPostsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      loadUserPosts(1, false);
    }
  }, [user?.userId]);

  const handlePostsRefresh = () => {
    setPostsRefreshing(true);
    setPostsPage(1);
    loadUserPosts(1, false);
  };

  const handlePostsLoadMore = () => {
    if (!postsHasMore || postsLoading) return;
    const nextPage = postsPage + 1;
    setPostsPage(nextPage);
    loadUserPosts(nextPage, true);
  };

  const handlePostCreated = () => {
    setPostsPage(1);
    loadUserPosts(1, false);
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

  const renderPostItem = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={handleLikePost}
      onComment={handleCommentPost}
      onEdit={handleEditPost}
      onDelete={handleDeletePost}
    />
  );

  const handlePickImage = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập thư viện ảnh!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], //ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const formData = new FormData();

        // Xác định MIME type dựa trên phần mở rộng file
        const extension = asset.uri?.split(".")?.pop()?.toLowerCase() ?? "jpg";
        const mimeType = extension === "png" ? "image/png" : "image/jpeg";
        const fileName = `${type === "profile" ? "profile" : "cover"}-image.${extension}`;

        formData.append("file", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as any);

        try {
          if (type === "profile") {
            await updateProfilePicture(formData);
          } else {
            await updateCoverImage(formData);
          }
          Alert.alert("Thành công", "Cập nhật ảnh thành công");
          await useAuthStore.getState().fetchUserInfo();
        } catch (error: any) {
          if (error.response?.data?.message) {
            Alert.alert("Lỗi", error.response.data.message);
          } else {
            Alert.alert("Lỗi", `Không thể cập nhật ảnh: ${error.message}`);
          }
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại sau.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white">
        <View className="relative">
          {/* Cover Image */}
          {userInfo?.coverImgUrl ? (
            <Image
              source={{ uri: userInfo?.coverImgUrl }}
              className="w-full h-[280px]"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-[280px] bg-gray-300" />
          )}

          {/* Header with transparent background */}
          <View
            className="absolute w-full flex-row justify-between p-4 z-50"
            style={{ paddingTop: insets.top }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
              <Ellipsis size={32} color="white" />
            </TouchableOpacity>
          </View>

          <View className="absolute -bottom-16 w-full items-center">
            <Avatar size="2xl">
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
              {userInfo?.profilePictureUrl && (
                <AvatarImage source={{ uri: userInfo.profilePictureUrl }} />
              )}
            </Avatar>
          </View>
        </View>

        {/* User Info */}
        <View className="mt-20 items-center">
          <Text className="text-2xl font-medium text-gray-800">
            {displayName}
          </Text>

          {/* Bio Field */}
          <View className="mt-2 px-8">
            <Text className="text-center text-gray-600 text-sm">
              {userInfo?.bio}
            </Text>
          </View>
        </View>

        {/* Posts Section */}
        <View className="mt-8 border-t border-gray-200 pt-4">
          {/* Posts Header */}
          <View className="px-4 mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Bài viết
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={{
                backgroundColor: Colors.light.PRIMARY,
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Posts List */}
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={postsRefreshing}
                onRefresh={handlePostsRefresh}
                colors={[Colors.light.PRIMARY]}
              />
            }
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            onEndReached={handlePostsLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              postsHasMore && posts.length > 0 ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator
                    size="small"
                    color={Colors.light.PRIMARY}
                  />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !postsLoading ? (
                <View
                  style={{
                    padding: 40,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
                    Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                  </Text>
                </View>
              ) : (
                <View style={{ padding: 40 }}>
                  <ActivityIndicator
                    size="small"
                    color={Colors.light.PRIMARY}
                  />
                </View>
              )
            }
          />
        </View>
      </ScrollView>

      {/* Modal Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowMenu(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl px-4 pb-6"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag Indicator */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Menu Options */}
            <View className="w-full">
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  router.push("/(screens)/(user)/info/edit.info" as any);
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <User size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Thông tin cá nhân
                </Text>
              </Pressable>

              <View className="h-px bg-gray-200" />

              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("profile");
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <Camera size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Đổi ảnh đại diện
                </Text>
              </Pressable>

              <View className="h-px bg-gray-200" />

              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handlePickImage("cover");
                }}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <ImageIcon size={24} color="#6B7280" />
                <Text className="ml-3 text-base text-gray-700">
                  Đổi ảnh bìa
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create Post Modal */}
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
