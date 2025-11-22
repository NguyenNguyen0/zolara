import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserCheck,
  Ellipsis,
  Plus,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import * as userService from "@/services/user-service";
import * as friendService from "@/services/friend-service";
import { useSocket } from "@/hooks/useSocket";
import { PostItem } from "@/components/post/post.item";
import { CreatePostModal } from "@/components/post/create-post.modal";
import { CommentModal } from "@/components/post/comment.modal";
import { postService, Post } from "@/services/post-service";
import { useAuthStore } from "@/store/authStore";

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id, introduce, refresh } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isPendingSent, setIsPendingSent] = useState(false);
  const [isPendingReceived, setIsPendingReceived] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [notRelated, setNotRelated] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
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
  const { user } = useAuthStore();
  const isCurrentUser = user?.userId === id;

  // Connect to the friends namespace for real-time updates
  const { socket, isConnected, error: socketError } = useSocket("friends");

  // Log socket connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log(`Socket connected to friends namespace for user ${id}`);
    } else if (socketError) {
      console.error(`Socket connection error for user ${id}:`, socketError);
    }
  }, [isConnected, socketError, id]);

  useEffect(() => {
    fetchUserInfo("mount");
    if (id) {
      loadUserPosts(1, false);
    }
  }, [id]);

  // Listen for reload events from the WebSocket server
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log(`Connected to friends socket for user ${id}`);

    // Listen for reload events
    const handleReload = () => {
      console.log("Received reload event from server, refreshing profile");
      fetchUserInfo("websocket");
    };

    socket.on("reload", handleReload);

    // Cleanup listener when component unmounts or socket changes
    return () => {
      console.log(`Removing reload listener for user ${id}`);
      socket.off("reload", handleReload);
    };
  }, [socket, isConnected, id]);

  // Cập nhật dữ liệu khi tham số refresh thay đổi
  useEffect(() => {
    if (refresh === "true") {
      console.log("Refreshing user profile due to refresh parameter");
      fetchUserInfo("refresh-param");
    }
  }, [refresh]);

  // Kiểm tra biến toàn cục khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      // @ts-ignore - Bỏ qua cảnh báo TypeScript về biến toàn cục
      const friendRequestSent = global.FRIEND_REQUEST_SENT;

      if (friendRequestSent && friendRequestSent.userId === id) {
        console.log("Detected friend request sent, refreshing profile");
        fetchUserInfo("focus");
        // Xóa biến toàn cục sau khi đã sử dụng
        // @ts-ignore
        global.FRIEND_REQUEST_SENT = null;
      }

      return () => {};
    }, [id]),
  );

  const fetchUserInfo = async (source: string = "manual") => {
    if (!id || typeof id !== "string") {
      setError("ID người dùng không hợp lệ");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching user profile for ID: ${id} (source: ${source})`);
      setIsLoading(true);
      setError(null);
      const userData = await userService.getUserProfile(id);
      setUserProfile(userData);

      // Kiểm tra trạng thái bạn bè và lời mời kết bạn từ dữ liệu API in ra đúng cấu trúc json format

      console.log("User profile data:", JSON.stringify(userData, null, 2));

      // console.log("User profile data:", JSON.stringify(userData));

      // Kiểm tra các trạng thái mối quan hệ
      setIsFriend(userData.relationship?.status === "FRIEND");
      setIsPendingSent(userData.relationship?.status === "PENDING_SENT");
      setIsPendingReceived(
        userData.relationship?.status === "PENDING_RECEIVED",
      );
      setNotRelated(userData.relationship?.status === "NONE");

      // Lưu friendRequestId nếu có
      if (userData.relationship?.friendshipId) {
        setFriendRequestId(userData.relationship.friendshipId);
      } else {
        setFriendRequestId(null);
      }

      // Xóa tham số refresh khỏi URL sau khi đã cập nhật dữ liệu
      if (refresh === "true") {
        // Sử dụng router.replace để thay thế URL hiện tại mà không thêm vào lịch sử
        router.setParams({ refresh: undefined });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Use id from params (which is the userId) and userProfile for name/avatar
    if (id && userProfile) {
      router.push({
        pathname: "/(screens)/(user)/chat/[id]" as any,
        params: {
          id: id as string,
          name: userProfile.userInfo?.fullName || "Người dùng",
          avatarUrl: userProfile.userInfo?.profilePictureUrl || "",
          type: "USER",
        },
      });
    }
  };

  const handleAddFriend = () => {
    if (!userProfile?.id) return;

    // Điều hướng đến màn hình gửi lời mời kết bạn
    router.push({
      pathname: "/(screens)/(user)/friend/request/[id]" as any,
      params: {
        id: userProfile.id,
        // Sử dụng introduce từ params nếu có, nếu không thì dùng mặc định
        introduce: introduce || "Xin chào, mình muốn kết bạn với bạn.",
      },
    });
  };

  const handleCancelFriendRequest = async () => {
    if (!friendRequestId) return;

    try {
      setIsLoading(true);
      await friendService.cancelFriendRequest(friendRequestId);
      // Cập nhật trạng thái
      setIsPendingSent(false);
      setFriendRequestId(null);
    } catch (error) {
      console.error("Error canceling friend request:", error);
      Alert.alert(
        "Lỗi",
        "Không thể hủy lời mời kết bạn. Vui lòng thử lại sau.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!userProfile?.id) return;

    try {
      setIsLoading(true);
      await friendService.unfriend(userProfile.id);
      // Cập nhật trạng thái
      setIsFriend(false);
      setNotRelated(true);
      setShowUnfriendConfirm(false);
      Alert.alert("Thành công", "Đã hủy kết bạn thành công");
    } catch (error) {
      console.error("Error unfriending:", error);
      Alert.alert("Lỗi", "Không thể hủy kết bạn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToFriendRequest = async (
    status: "ACCEPTED" | "DECLINED",
  ) => {
    if (!friendRequestId) return;

    try {
      setIsLoading(true);
      await friendService.respondToFriendRequest(friendRequestId, status);

      // Cập nhật trạng thái
      if (status === "ACCEPTED") {
        setIsFriend(true);
      }
      setIsPendingReceived(false);
      setFriendRequestId(null);
    } catch (error) {
      console.error(
        `Error ${status === "ACCEPTED" ? "accepting" : "rejecting"} friend request:`,
        error,
      );
      Alert.alert(
        "Lỗi",
        `Không thể ${status === "ACCEPTED" ? "đồng ý" : "từ chối"} lời mời kết bạn. Vui lòng thử lại sau.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async (pageNum: number = 1, append: boolean = false) => {
    if (!id || typeof id !== "string") return;
    try {
      setPostsLoading(true);
      const response = await postService.getUserPosts(id, pageNum, 20);
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

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={Colors.light.PRIMARY} />
            <Text className="text-gray-500 mt-2">Đang tải thông tin...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-red-500">{error}</Text>
            <Pressable
              onPress={() => fetchUserInfo("retry")}
              style={{
                marginTop: 16, // mt-4
                backgroundColor: Colors.light.PRIMARY_50,
                paddingHorizontal: 16, // px-4
                paddingVertical: 8, // py-2
                borderRadius: 9999, // rounded-full
              }}
            >
              <Text style={{ color: Colors.light.PRIMARY_500 }}>Thử lại</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="relative">
              {/* Cover Image */}
              {userProfile?.userInfo?.coverImgUrl ? (
                <Image
                  source={{ uri: userProfile.userInfo.coverImgUrl }}
                  className="w-full h-[280px]"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-[280px] bg-gray-300" />
              )}

              {/* Header with transparent background */}
              <View
                className="absolute w-full flex-row justify-between p-4"
                style={{ paddingTop: insets.top }}
              >
                {/* WebSocket connection status indicator */}
                <Pressable onPress={() => router.back()}>
                  <ArrowLeft size={28} color="white" />
                </Pressable>
                {isFriend && (
                  <>
                    <Pressable onPress={() => setShowMenu(true)}>
                      <Ellipsis size={32} color="white" />
                    </Pressable>

                    {/* Menu Modal - Bottom Sheet Style */}
                    <Modal
                      transparent
                      visible={showMenu}
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

                          <View className="w-full mt-2">
                            <Pressable
                              className="px-4 py-4 active:bg-gray-100"
                              onPress={() => {
                                setShowMenu(false);
                                setShowUnfriendConfirm(true);
                              }}
                            >
                              <Text className="text-base text-red-500 font-medium text-center">
                                Hủy kết bạn
                              </Text>
                            </Pressable>

                            <View className="h-px bg-gray-200 my-2" />

                            <Pressable
                              className="px-4 py-4 active:bg-gray-100"
                              onPress={() => setShowMenu(false)}
                            >
                              <Text className="text-base text-gray-800 font-medium text-center">
                                Hủy
                              </Text>
                            </Pressable>
                          </View>
                        </Pressable>
                      </Pressable>
                    </Modal>
                  </>
                )}
              </View>

              <View className="absolute -bottom-16 w-full items-center">
                <View className="w-32 h-32 rounded-full bg-gray-300 items-center justify-center overflow-hidden border-4 border-white">
                  {userProfile?.userInfo?.profilePictureUrl ? (
                    <Image
                      source={{ uri: userProfile.userInfo.profilePictureUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-3xl font-bold text-gray-600">
                      {(userProfile?.userInfo?.fullName || "User")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* User Info */}
            <View className="mt-20 items-center">
              <Text className="text-2xl font-medium text-gray-800">
                {userProfile?.userInfo?.fullName || "Người dùng"}
              </Text>
              {userProfile?.userInfo?.bio && (
                <Text className="text-gray-500 mt-2 px-4 text-center">
                  {userProfile.userInfo.bio}
                </Text>
              )}
            </View>

            {/* Status message */}
            <View className="mt-4 items-center">
              {isPendingSent ? (
                <Text className="text-gray-500 text-center px-8">
                  Lời mời kết bạn đã được gửi đi. Hãy để lại tin nhắn cho{" "}
                  {userProfile?.userInfo?.fullName || "người dùng này"} trong
                  lúc chờ đợi nhé!
                </Text>
              ) : isPendingReceived ? (
                <Text className="text-gray-500 text-center px-8">
                  {userProfile?.userInfo?.fullName || "Người dùng này"} đã gửi
                  cho bạn lời mời kết bạn
                </Text>
              ) : notRelated ? (
                <Text className="text-gray-500 text-center px-8">
                  Bạn chưa thể xem nhật ký của{" "}
                  {userProfile?.userInfo?.fullName || "người dùng này"} khi chưa
                  là bạn bè
                </Text>
              ) : null}
            </View>

            {/* Action Buttons */}
            <View className="mt-6 px-4 flex-row justify-center gap-4">
              {isFriend || isCurrentUser ? (
                <Pressable
                  className="flex-1 py-2.5 rounded-full items-center flex-row justify-center"
                  style={{ backgroundColor: Colors.light.PRIMARY_500 }}
                  onPress={isCurrentUser ? undefined : handleSendMessage}
                >
                  <MessageCircle size={24} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {isCurrentUser ? "Hồ sơ của bạn" : "Nhắn tin"}
                  </Text>
                </Pressable>
              ) : isPendingSent ? (
                <Pressable
                  className="flex-1 bg-gray-200 py-2.5 rounded-full items-center flex-row justify-center"
                  onPress={handleCancelFriendRequest}
                >
                  <UserCheck size={24} color="gray" />
                  <Text className="text-gray-500 font-medium ml-2">
                    Hủy lời mời kết bạn
                  </Text>
                </Pressable>
              ) : isPendingReceived ? (
                <View className="w-full flex-row justify-center gap-2">
                  {/* Nút đồng ý */}
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: Colors.light.PRIMARY_500,
                    }}
                    className="py-2.5 rounded-full items-center justify-center"
                    onPress={() => handleRespondToFriendRequest("ACCEPTED")}
                  >
                    <Text className="text-white font-medium">Đồng ý</Text>
                  </Pressable>

                  {/* Nút từ chối */}
                  <Pressable
                    style={{ flex: 1 }}
                    className="bg-gray-200 py-2.5 rounded-full items-center justify-center"
                    onPress={() => handleRespondToFriendRequest("DECLINED")}
                  >
                    <Text className="text-gray-500 font-medium">Từ chối</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="w-full flex-row justify-center gap-2">
                  <Pressable
                    style={{
                      flex: 2,
                      backgroundColor: Colors.light.PRIMARY_50,
                    }}
                    className="ml-1 py-2.5 rounded-full items-center justify-center flex-row"
                    onPress={handleAddFriend}
                  >
                    <UserPlus size={24} color="black" />
                    <Text className="ml-2 font-medium">Kết bạn</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Posts Section */}
            {(isFriend || isCurrentUser) && (
              <View className="mt-8">
                {/* Posts Header */}
                <View className="px-4 mb-4 flex-row justify-between items-center">
                  <Text className="text-lg font-semibold text-gray-800">
                    Bài viết
                  </Text>
                  {isCurrentUser && (
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
                  )}
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
                          {isCurrentUser
                            ? "Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!"
                            : "Chưa có bài viết nào"}
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
            )}
          </>
        )}
      </ScrollView>

      {/* Unfriend Confirmation Modal */}
      {userProfile && (
        <Modal
          transparent
          visible={showUnfriendConfirm}
          animationType="slide"
          onRequestClose={() => setShowUnfriendConfirm(false)}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowUnfriendConfirm(false)}
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

              <View className="items-center w-full mt-2 mb-6">
                <Text className="mb-4 text-xl font-bold text-center">
                  Xác nhận hủy kết bạn
                </Text>
                <Text className="mb-6 text-base text-center text-gray-600">
                  Bạn có chắc chắn muốn hủy kết bạn với{" "}
                  {userProfile?.userInfo?.fullName || "người dùng này"} không?
                </Text>

                <View className="flex-row justify-between w-full gap-4">
                  <Pressable
                    className="flex-1 px-4 py-3 border border-red-500 rounded-full"
                    onPress={() => setShowUnfriendConfirm(false)}
                  >
                    <Text className="text-base font-semibold text-center text-red-500">
                      Hủy bỏ
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 px-4 py-3 rounded-full"
                    style={{ backgroundColor: "#ef4444" }}
                    onPress={handleUnfriend}
                  >
                    <Text className="text-base font-semibold text-center text-white">
                      Xác nhận
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Create Post Modal */}
      {isCurrentUser && (
        <CreatePostModal
          visible={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditPost(null);
          }}
          onPostCreated={handlePostCreated}
          editPost={editPost}
        />
      )}

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
    </>
  );
}
