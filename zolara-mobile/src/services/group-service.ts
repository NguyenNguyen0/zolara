import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";
import { Group, GroupInfo, GroupMember } from "@/types";

// Interface for group member request payload
export interface GroupMemberRequest {
  userId: string;
  addedById: string;
}

// Interface for creating a group
export interface CreateGroupRequest {
  name: string;
  creatorId: string;
  initialMembers: GroupMemberRequest[];
  file?: any; // File can be any type to match actual usage
  avatar?: string | null;
}

// Interface for group chat data
export interface GroupChat {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  memberCount: number;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
}

// Interface for updating group information
export interface UpdateGroupRequest {
  name?: string;
  avatarUrl?: string;
}

// Interface for adding a member to a group
export interface AddMemberRequest {
  groupId: string;
  userId: string;
}

/**
 * Create a new group with the given name and initial members
 */
export const createGroup = async (
  name: string,
  initialMembers: string[],
  avatarFile?: any,
): Promise<GroupChat> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    // Get user information from SecureStore
    const userStr = await SecureStore.getItemAsync("user");
    console.log("User data in SecureStore:", userStr);

    if (!userStr) {
      throw new Error("User data not found");
    }

    // Parse user information
    const userData = JSON.parse(userStr);
    console.log("Parsed user data:", userData);

    // Get userId from user object
    const userId = userData.userId;
    console.log("User ID from user object:", userId);

    if (!userId) {
      throw new Error("User ID not found in user data");
    }

    // Create initial members list
    const members = initialMembers.map((memberId) => ({
      userId: memberId,
      addedById: userId,
    }));

    // If there's an avatar file, use FormData
    if (avatarFile) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("creatorId", userId);
      formData.append("initialMembers", JSON.stringify(members));
      formData.append("file", avatarFile);

      console.log(
        "FormData being sent:",
        JSON.stringify({
          name,
          creatorId: userId,
          initialMembers: members,
          hasFile: true,
        }),
      );

      const response = await axiosInstance.post(`/groups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } else {
      // If no avatar file, use JSON
      const data = {
        name,
        creatorId: userId,
        avatar: null,
        initialMembers: members,
      };

      console.log("JSON data being sent:", JSON.stringify(data));

      const response = await axiosInstance.post(`/groups`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    }
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

/**
 * Get list of groups
 */
export const getGroupList = async (): Promise<GroupChat[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group list:", error);
    throw error;
  }
};

/**
 * Get details of a specific group
 */
export const getGroupDetails = async (groupId: string): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

/**
 * Get basic information about a group
 */
export const getGroupInfo = async (groupId: string): Promise<GroupInfo> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/groups/${groupId}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching group info:", error);
    throw error;
  }
};

/**
 * Update group information
 */
export const updateGroupInfo = async (
  groupId: string,
  updateData: UpdateGroupRequest,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.patch(
      `/groups/${groupId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating group info:", error);
    throw error;
  }
};

/**
 * Add a single member to a group
 */
export const addMemberToGroup = async (
  groupId: string,
  userId: string,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const userStr = await SecureStore.getItemAsync("user");

    if (!userStr) {
      throw new Error("User data not found");
    }

    // Parse user information to get current user ID
    const userData = JSON.parse(userStr);
    const currentUserId = userData.userId;

    if (!currentUserId) {
      throw new Error("Current user ID not found");
    }

    // Prepare the request payload
    const payload = {
      groupId,
      userId,
      addedById: currentUserId,
      role: "MEMBER",
    };

    console.log("Adding member to group with payload:", payload);

    const response = await axiosInstance.post(`/groups/members`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding member to group:", error);
    throw error;
  }
};

/**
 * Add multiple members to a group
 */
export const addMembersToGroup = async (
  groupId: string,
  memberIds: string[],
): Promise<any> => {
  try {
    console.log(`Adding ${memberIds.length} members to group ${groupId}`);

    // Add members one by one
    const results = [];
    for (const userId of memberIds) {
      const result = await addMemberToGroup(groupId, userId);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Error adding members to group:", error);
    throw error;
  }
};

/**
 * Remove a member from a group
 */
export const removeMemberFromGroup = async (
  groupId: string,
  memberId: string,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.delete(
      `/groups/${groupId}/members/${memberId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error removing member from group:", error);
    throw error;
  }
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: string): Promise<any> => {
  try {
    console.log(`Calling API to leave group ${groupId}`);
    const token = await SecureStore.getItemAsync("accessToken");
    console.log("Token retrieved for leave group API call");

    const response = await axiosInstance.post(
      `/groups/${groupId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Leave group API response:", response.status, response.data);
    return true; // Trả về true để xác nhận thành công
  } catch (error: any) {
    console.error(
      "Error leaving group:",
      error?.response?.status,
      error?.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Update group avatar
 */
export const updateGroupAvatar = async (
  groupId: string,
  avatarFile: any,
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    // If avatarFile is already a FormData object, use it directly
    const formData =
      avatarFile instanceof FormData ? avatarFile : new FormData();

    // If it's not a FormData object, append the file
    if (!(avatarFile instanceof FormData)) {
      formData.append("file", avatarFile);
    }

    const response = await axiosInstance.patch(
      `/groups/${groupId}/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating group avatar:", error);
    throw error;
  }
};

/**
 * Update a member's role in a group
 */
export const updateMemberRole = async (
  groupId: string,
  memberId: string,
  role: "MEMBER" | "CO_LEADER" | "LEADER",
): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.patch(
      `/groups/${groupId}/members/${memberId}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
};

/**
 * Get list of groups for the current user
 */
export const getUserGroups = async (): Promise<GroupChat[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    console.log("Calling API to get user groups");
    const response = await axiosInstance.get(`/groups/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("User groups API response:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
};

/**
 * Get public information about a group
 */
export const getPublicGroupInfo = async (
  groupId: string,
): Promise<{
  id: string;
  name: string;
  memberCount: number;
  avatarUrl?: string;
}> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    console.log(`Calling API to get public info for group ${groupId}`);
    const response = await axiosInstance.get(`/groups/${groupId}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Group public info API response:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error fetching group public info:", error);
    throw error;
  }
};

/**
 * Join a group via link or QR code
 */
export const joinGroup = async (
  groupId: string,
): Promise<{
  groupId: string;
  role: string;
}> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    console.log(`Calling API to join group ${groupId}`);
    const response = await axiosInstance.post(
      `/groups/join`,
      { groupId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("Join group API response:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

/**
 * Group service object for components that expect an object-based API
 */
export const groupService = {
  createGroup,
  getGroupList,
  getGroupDetails,
  getGroupInfo,
  updateGroup: updateGroupInfo, // Alias for compatibility
  updateGroupInfo,
  addMemberToGroup,
  addMembersToGroup,
  removeMember: removeMemberFromGroup, // Alias for compatibility
  removeMemberFromGroup,
  leaveGroup,
  getUserGroups,
  getPublicGroupInfo,
  joinGroup,
  deleteGroup: async (groupId: string): Promise<boolean> => {
    try {
      console.log(`Calling API to delete group ${groupId}`);
      const token = await SecureStore.getItemAsync("accessToken");
      console.log("Token retrieved for delete group API call");

      const response = await axiosInstance.delete(`/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete group API response:", response.status, response.data);
      return true;
    } catch (error: any) {
      console.error(
        "Error deleting group:",
        error?.response?.status,
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
  updateGroupAvatar,
  updateMemberRole,
};
