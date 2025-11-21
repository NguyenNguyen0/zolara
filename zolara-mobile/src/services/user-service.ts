import { useAuthStore } from "@/store/authStore";
import axiosInstance from "../lib/axios";
import {
  ChangePasswordData,
  ChatItemData,
  UpdateBasicInfoData,
  User,
  UserData,
  UserInfo,
} from "@/types";
import * as SecureStore from "expo-secure-store";

export const getAllUsers = async (): Promise<ChatItemData[]> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get("/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw error;
  }
};

export const getUserInfo = async (userId: string): Promise<UserInfo> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}/basic-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về trực tiếp UserInfo
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};
export const getUserData = async (userId: string): Promise<UserData> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Trả về trực tiếp UserInfo
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<any> => {
  console.log("Fetching user profile for ID:", userId);
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("User profile data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateBasicInfo = async (
  data: UpdateBasicInfoData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-basic-info", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log("Updated userInfo in state:", updatedUserInfo);
    }
  } catch (error) {
    console.error("Error updating basic info:", error);
    throw error;
  }
};

export const updateProfilePicture = async (
  formData: FormData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-profile-picture", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log(
        "Updated userInfo after profile picture update:",
        updatedUserInfo,
      );
    }
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
};

export const updateCoverImage = async (formData: FormData): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/update-cover-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId); // Lấy UserInfo trực tiếp

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
      console.log(
        "Updated userInfo after cover image update:",
        updatedUserInfo,
      );
    }
  } catch (error) {
    console.error("Error updating cover image:", error);
    throw error;
  }
};

export const changePassword = async (
  data: ChangePasswordData,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.put("/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};

// Tìm kiếm người dùng bằng email hoặc số điện thoại
export const searchUser = async (searchData: {
  email?: string;
  phoneNumber?: string;
}): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post("/users/search", searchData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Search user data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching user:", error);
    throw error;
  }
};

// Khởi tạo quá trình đổi email
export const initiateEmailUpdate = async (
  newEmail: string,
): Promise<{ updateId: string }> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post(
      "/auth/update-email/initiate",
      { newEmail },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Initiate email update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error initiating email update:", error);
    throw error;
  }
};

// Xác thực OTP để hoàn tất đổi email
export const verifyEmailUpdate = async (
  otp: string,
  updateId: string,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.post(
      "/auth/update-email/verify",
      { otp, updateId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Cập nhật thông tin người dùng sau khi đổi email thành công
    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId);

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
    }
  } catch (error) {
    console.error("Error verifying email update:", error);
    throw error;
  }
};

// Khởi tạo quá trình đổi số điện thoại
export const initiatePhoneUpdate = async (
  newPhoneNumber: string,
): Promise<{ updateId: string }> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    const response = await axiosInstance.post(
      "/auth/update-phone/initiate",
      { newPhoneNumber },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Initiate phone update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error initiating phone update:", error);
    throw error;
  }
};

// Xác thực OTP để hoàn tất đổi số điện thoại
export const verifyPhoneUpdate = async (
  otp: string,
  updateId: string,
): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    await axiosInstance.post(
      "/auth/update-phone/verify",
      { otp, updateId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Cập nhật thông tin người dùng sau khi đổi số điện thoại thành công
    const userStr = await SecureStore.getItemAsync("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUserInfo = await getUserInfo(user.userId);

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(
        "userInfo",
        JSON.stringify(updatedUserInfo),
      );

      // Cập nhật state
      useAuthStore.setState({ userInfo: updatedUserInfo });
    }
  } catch (error) {
    console.error("Error verifying phone update:", error);
    throw error;
  }
};
