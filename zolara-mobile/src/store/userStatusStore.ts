import { create } from "zustand";

type UserStatus = "online" | "offline" | "typing";

interface UserStatusState {
  userStatuses: Map<
    string,
    { status: UserStatus; timestamp: Date; lastActivity?: Date }
  >;
  setUserStatus: (
    userId: string,
    status: UserStatus,
    timestamp: Date,
    lastActivity?: Date,
  ) => void;
  getUserStatus: (
    userId: string,
  ) => { status: UserStatus; timestamp: Date; lastActivity?: Date } | undefined;
  isUserOnline: (userId: string) => boolean;
  isUserTyping: (userId: string) => boolean;
  getLastActivity: (userId: string) => Date | undefined;
  requestStatusUpdate: (userIds: string[]) => void;
}

export const useUserStatusStore = create<UserStatusState>((set, get) => ({
  userStatuses: new Map(),

  setUserStatus: (userId, status, timestamp, lastActivity) => {
    set((state) => ({
      userStatuses: new Map(state.userStatuses).set(userId, {
        status,
        timestamp,
        lastActivity: lastActivity || timestamp,
      }),
    }));
  },

  getUserStatus: (userId) => {
    return get().userStatuses.get(userId);
  },

  isUserOnline: (userId) => {
    const status = get().userStatuses.get(userId);
    return status?.status === "online" || status?.status === "typing";
  },

  isUserTyping: (userId) => {
    const status = get().userStatuses.get(userId);
    return status?.status === "typing";
  },

  getLastActivity: (userId) => {
    const status = get().userStatuses.get(userId);
    return status?.lastActivity || status?.timestamp;
  },

  // Hàm này sẽ được gọi từ các component để yêu cầu cập nhật trạng thái
  requestStatusUpdate: (userIds) => {
    // Truy cập window.messageSocket nếu có sẵn
    if (typeof window !== "undefined" && window.messageSocket) {
      window.messageSocket.emit("getUsersStatus", { userIds });
    }
  },
}));
