import axiosInstance from "../lib/axios";
import * as SecureStore from "expo-secure-store";

export interface Post {
  id: string;
  userId: string;
  content: string | null;
  media: any;
  privacyLevel: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    userInfo: {
      fullName: string;
      profilePictureUrl: string | null;
    };
  };
  reactions: Array<{
    id: string;
    userId: string;
    reactionType: string;
    reactedAt: string;
    user: {
      id: string;
      userInfo: {
        fullName: string;
        profilePictureUrl: string | null;
      };
    };
  }>;
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    repliedTo: string | null;
    createdAt: string;
    user: {
      id: string;
      userInfo: {
        fullName: string;
        profilePictureUrl: string | null;
      };
    };
  }>;
  _count: {
    reactions: number;
    comments: number;
    hiddenBy: number;
  };
  isLiked?: boolean; // Computed field: whether current user liked this post
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  repliedTo: string | null;
  createdAt: string;
  user: {
    id: string;
    userInfo: {
      fullName: string;
      profilePictureUrl: string | null;
    };
  };
}

export interface CommentsResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePostData {
  content?: string;
  privacyLevel?: "public" | "friends" | "private";
  files?: any[];
}

class PostService {
  /**
   * Get feed posts (me & friends)
   */
  async getFeedPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.get("/posts/feed", {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching feed posts:", error);
      throw error;
    }
  }

  /**
   * Get my posts
   */
  async getMyPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.get("/posts/my", {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my posts:", error);
      throw error;
    }
  }

  /**
   * Get posts by user ID
   */
  async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PostsResponse> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.get("/posts", {
        params: { userId, page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string): Promise<Post> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.get(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  /**
   * Create post
   */
  async createPost(formData: FormData): Promise<Post> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  /**
   * Update post
   */
  async updatePost(postId: string, formData: FormData): Promise<Post> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.put(`/posts/${postId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      await axiosInstance.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  /**
   * Toggle like on a post
   */
  async toggleLikePost(postId: string): Promise<{ liked: boolean }> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.post(`/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CommentsResponse> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.get(`/posts/${postId}/comments`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  /**
   * Create a comment on a post
   */
  async createComment(
    postId: string,
    content: string,
    repliedTo?: string,
  ): Promise<Comment> {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await axiosInstance.post(
        `/posts/${postId}/comments`,
        {
          content,
          repliedTo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }
}

export const postService = new PostService();

