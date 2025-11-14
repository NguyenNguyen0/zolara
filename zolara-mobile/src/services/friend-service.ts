import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";

export interface UserInfo {
  id?: string;
  fullName?: string;
  statusMessage?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  coverImgUrl?: string;
  lastSeen?: string;
  profilePictureUrl?: string;
}

export interface Friend {
  friend: {
    email: string;
    id: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
  friendshipId: string;
  since: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  introduce: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
  receiver?: {
    id: string;
    email: string;
    phoneNumber: string;
    userInfo: UserInfo;
  };
}

export const getFriendList = async (): Promise<Friend[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching friend list:", error);
    throw error;
  }
};

// Interface cho contact item
export interface ContactItem {
  name: string;
  phone: string;
}

// Interface cho contact user
export interface ContactUser {
  id: string;
  userId: string;
  contactUserId: string;
  nickname: string;
  addedAt: string;
  contactUser: {
    id: string;
    phoneNumber: string;
    userInfo: {
      fullName: string;
      profilePictureUrl: string | null;
      coverImgUrl: string | null;
      statusMessage: string | null;
      lastSeen: string;
    };
  };
  relationship: {
    status: string;
    message: string;
    friendshipId: string;
  };
}

// Đồng bộ danh bạ điện thoại
export const syncContacts = async (
  contacts: ContactItem[],
): Promise<{ message: string; created: number; deleted: number }> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post(
      `/contacts/sync`,
      { contacts },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error syncing contacts:", error);
    throw error;
  }
};

// Lấy danh sách người dùng đã được đồng bộ
export const getContacts = async (): Promise<ContactUser[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/contacts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Hàm cũ để tương thích ngược
export const updatePhoneContacts = async (
  contacts?: ContactItem[],
): Promise<void> => {
  try {
    if (contacts && contacts.length > 0) {
      await syncContacts(contacts);
    } else {
      // Nếu không có danh sách contacts, gọi API cũ để tương thích ngược
      const token = await SecureStore.getItemAsync("accessToken");
      await axiosInstance.post(
        `/friends/sync-contacts`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }
  } catch (error) {
    console.error("Error updating phone contacts:", error);
    throw error;
  }
};

// Lấy danh sách lời mời kết bạn đã nhận
export const getReceivedFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/requests/received`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching received friend requests:", error);
    throw error;
  }
};

// Lấy danh sách lời mời kết bạn đã gửi
export const getSentFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/friends/requests/sent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    throw error;
  }
};

// Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối)
export const respondToFriendRequest = async (
  requestId: string,
  status: "ACCEPTED" | "DECLINED",
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put(
      `/friends/respond`,
      {
        requestId,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      `Error ${status === "ACCEPTED" ? "accepting" : "rejecting"} friend request:`,
      error,
    );
    throw error;
  }
};

// Chấp nhận lời mời kết bạn (giữ lại để tương thích ngược)
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  return respondToFriendRequest(requestId, "ACCEPTED");
};

// Từ chối lời mời kết bạn (giữ lại để tương thích ngược)
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  return respondToFriendRequest(requestId, "DECLINED");
};

// Hủy lời mời kết bạn đã gửi
export const cancelFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.delete(`/friends/request/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    throw error;
  }
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (
  receiverId: string,
  introduce: string,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post(
      `/friends/request`,
      {
        receiverId,
        introduce,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

// Hủy kết bạn
export const unfriend = async (userId: string): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.delete(`/friends/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error unfriending:", error);
    throw error;
  }
};

// Tìm kiếm bạn bè
export const searchFriends = async (query: string): Promise<Friend[]> => {
  try {
    // Lấy danh sách bạn bè
    const friends = await getFriendList();

    // Nếu query rỗng, trả về tất cả bạn bè
    if (!query || query.trim() === "") {
      return friends;
    }

    // Tìm kiếm bạn bè theo tên hoặc số điện thoại
    const normalizedQuery = query.toLowerCase().trim();
    return friends.filter((friend) => {
      const fullName = friend.friend.userInfo.fullName?.toLowerCase() || "";
      const phoneNumber = friend.friend.phoneNumber?.toLowerCase() || "";
      const email = friend.friend.email?.toLowerCase() || "";

      return (
        fullName.includes(normalizedQuery) ||
        phoneNumber.includes(normalizedQuery) ||
        email.includes(normalizedQuery)
      );
    });
  } catch (error) {
    console.error("Error searching friends:", error);
    throw error;
  }
};
