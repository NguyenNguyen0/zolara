import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { Message, ReactionType } from "@/types";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStatusStore } from "@/store/userStatusStore";
import { useConversationsStore } from "@/store/conversationsStore";
import { notificationService } from "@/services/notification-service";
import { AppState, AppStateStatus } from "react-native";
import { useRouter } from "expo-router";

// Định nghĩa context cho các socket
interface SocketContextType {
  mainSocket: Socket | null;
  messageSocket: Socket | null;
  groupSocket: Socket | null;
  isMainConnected: boolean;
  isMessageConnected: boolean;
  isGroupConnected: boolean;
  reconnectMessageSocket: () => void; // Thêm hàm reconnect message socket
}

const SocketContext = createContext<SocketContextType>({
  mainSocket: null,
  messageSocket: null,
  groupSocket: null,
  isMainConnected: false,
  isMessageConnected: false,
  isGroupConnected: false,
  reconnectMessageSocket: () => {}, // Giá trị mặc định
});
const baseUrl = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.split("/api/v1")[0]
  : "http://bondhub.cloud:3000";

// Hook để sử dụng socket trong các component
export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);
  const [messageSocket, setMessageSocket] = useState<Socket | null>(null);
  const [groupSocket, setGroupSocket] = useState<Socket | null>(null);
  const [isMainConnected, setIsMainConnected] = useState(false);
  const [isMessageConnected, setIsMessageConnected] = useState(false);
  const [isGroupConnected, setIsGroupConnected] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const currentUser = useAuthStore((state) => state.user);
  const router = useRouter();

  // Theo dõi trạng thái ứng dụng (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("App state changed to:", nextAppState);
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Chat store actions
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    setTypingUsers,
    removeTypingUser,
  } = useChatStore();

  // Thiết lập group socket listeners
  const setupGroupSocketListeners = (socket: Socket) => {
    socket.on(
      "addedToGroup",
      (data: {
        groupId: string;
        groupName: string;
        addedBy: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Received addedToGroup event:", data);
        console.log("[SocketProvider] Current user ID:", currentUser?.userId);

        // Hiển thị thông báo cho người dùng
        notificationService.scheduleLocalNotification(
          "Nhóm mới",
          `Bạn đã được thêm vào nhóm ${data.groupName}`,
          { groupId: data.groupId },
        );

        // Cập nhật danh sách cuộc trò chuyện
        reloadConversationList();
      },
    );

    // Handle khi nhóm bị giải tán
    socket.on(
      "groupDissolved",
      (data: {
        groupId: string;
        groupName: string;
        dissolvedBy: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Received groupDissolved event:", data);
        console.log("[SocketProvider] Current user ID:", currentUser?.userId);

        // Hiển thị thông báo cho người dùng
        notificationService.scheduleLocalNotification(
          "Nhóm đã bị giải tán",
          `Nhóm ${data.groupName} đã bị giải tán bởi quản trị viên`,
          { groupId: data.groupId },
        );

        // Cập nhật danh sách cuộc trò chuyện
        reloadConversationList();

        // Nếu đang ở trong màn hình chat của nhóm này, chuyển về màn hình khác
        const chatStore = useChatStore.getState();
        if (
          chatStore.currentChat?.type === "GROUP" &&
          chatStore.currentChat?.id === data.groupId
        ) {
          router.replace("/");
        }
      },
    );

    socket.on(
      "removedFromGroup",
      (data: {
        groupId: string;
        groupName: string;
        removedBy?: string;
        kicked: boolean;
        left: boolean;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Received removedFromGroup event:", data);

        // Display appropriate notification based on event type
        if (data.kicked) {
          notificationService.scheduleLocalNotification(
            "Đã bị xóa khỏi nhóm",
            `Bạn đã bị xóa khỏi nhóm ${data.groupName}`,
            { groupId: data.groupId },
          );
        } else if (data.left) {
          notificationService.scheduleLocalNotification(
            "Đã rời nhóm",
            `Bạn đã rời khỏi nhóm ${data.groupName}`,
            { groupId: data.groupId },
          );
        }

        // Update conversation list
        reloadConversationList();

        // Navigate away if currently in this group's chat
        const chatStore = useChatStore.getState();
        if (
          chatStore.currentChat?.type === "GROUP" &&
          chatStore.currentChat?.id === data.groupId
        ) {
          router.replace("/");
        }
      },
    );
  };

  // Thiết lập message socket listeners
  const setupMessageSocketListeners = (socket: Socket) => {
    // Handle khi cần cập nhật danh sách nhóm
    socket.on(
      "updateGroupList",
      (data: { action: string; groupId?: string; timestamp: Date }) => {
        console.log("[SocketProvider] Received updateGroupList event:", data);
        console.log("[SocketProvider] Current user ID:", currentUser?.userId);

        if (data.action === "added_to_group") {
          // Cập nhật danh sách cuộc trò chuyện khi được thêm vào nhóm mới
          reloadConversationList();
        } else if (data.action === "removed_from_group") {
          // Cập nhật danh sách cuộc trò chuyện
          reloadConversationList();
        }
      },
    );

    // Handle khi cần cập nhật danh sách cuộc trò chuyện
    socket.on(
      "updateConversationList",
      (data: { action: string; groupId?: string; timestamp: Date }) => {
        console.log("[SocketProvider] Update conversation list:", data);

        if (data.action === "group_dissolved") {
          // Cập nhật danh sách cuộc trò chuyện
          reloadConversationList();
        }
      },
    );
    // Handle new message
    socket.on(
      "newMessage",
      (data: {
        message: Message;
        type: "user" | "group";
        timestamp: string;
      }) => {
        // Chuyển đổi cấu trúc message trước khi thêm vào store
        const normalizedMessage: Message = {
          ...data.message,
          content: {
            text: data.message.content.text || "",
            media: data.message.content.media || [],
          },
          senderId: data.message.senderId, // Cần bổ sung thông tin sender nếu cần
          receiverId: data.message.receiverId, // Cần bổ sung thông tin receiver nếu cần
          createdAt: data.message.createdAt,
          updatedAt: data.message.updatedAt,
          readBy: data.message.readBy || [],
          deletedBy: data.message.deletedBy || [],
          recalled: data.message.recalled || false,
          messageType: data.message.messageType,
          repliedTo: data.message.repliedTo,
          forwardedFrom: data.message.forwardedFrom,
        };

        // Chỉ thêm tin nhắn vào store nếu đang ở đúng cuộc trò chuyện
        const chatStore = useChatStore.getState();
        const currentChat = chatStore.currentChat;

        // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
        const isCurrentUserChat =
          currentChat?.type === "USER" &&
          ((normalizedMessage.senderId === currentChat.id &&
            normalizedMessage.receiverId === currentUser?.userId) ||
            (normalizedMessage.receiverId === currentChat.id &&
              normalizedMessage.senderId === currentUser?.userId));

        const isCurrentGroupChat =
          currentChat?.type === "GROUP" &&
          normalizedMessage.messageType === "GROUP" &&
          normalizedMessage.groupId === currentChat.id;

        // Chỉ thêm tin nhắn nếu đang ở đúng cuộc trò chuyện
        if (isCurrentUserChat || isCurrentGroupChat) {
          addMessage(normalizedMessage);
        }

        // Hiển thị thông báo nếu tin nhắn không phải từ người dùng hiện tại
        // và ứng dụng đang ở background hoặc không ở trong cuộc trò chuyện hiện tại
        if (
          normalizedMessage.senderId !== currentUser?.userId &&
          (appState !== "active" || (!isCurrentUserChat && !isCurrentGroupChat))
        ) {
          // Tạo thông báo cho tin nhắn mới
          notificationService.createMessageNotification(normalizedMessage);
        }

        // Cập nhật trạng thái người gửi thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(
          data.message.senderId,
          "online",
          new Date(),
        );

        // Yêu cầu cập nhật trạng thái của người gửi
        requestUserStatus(socket, data.message.senderId);

        // Tự động cập nhật danh sách cuộc trò chuyện ở trang chủ
        const conversationsStore = useConversationsStore.getState();
        conversationsStore.fetchConversations(1);
      },
    );

    // Handle message update (recall)
    socket.on("messageRecalled", (data: { messageId: string }) => {
      // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
      const chatStore = useChatStore.getState();
      const message = chatStore.messages.find((m) => m.id === data.messageId);

      if (message) {
        // Chỉ cập nhật tin nhắn nếu tin nhắn thuộc cuộc trò chuyện hiện tại
        updateMessage(data.messageId, { recalled: true });
      }

      // Cập nhật danh sách cuộc trò chuyện
      const conversationsStore = useConversationsStore.getState();
      conversationsStore.fetchConversations(1);
    });

    // Handle message deletion
    socket.on("messageDeleted", (data: { messageId: string }) => {
      // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
      const chatStore = useChatStore.getState();
      const message = chatStore.messages.find((m) => m.id === data.messageId);

      if (message) {
        // Chỉ xóa tin nhắn nếu tin nhắn thuộc cuộc trò chuyện hiện tại
        deleteMessage(data.messageId);
      }

      // Cập nhật danh sách cuộc trò chuyện
      const conversationsStore = useConversationsStore.getState();
      conversationsStore.fetchConversations(1);
    });

    // Handle reaction updates
    socket.on(
      "messageReactionUpdated",
      (data: {
        messageId: string;
        reactions: Array<{ userId: string; reaction: string; count?: number }>;
        userId: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Reaction update received:", data);

        // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
        const chatStore = useChatStore.getState();
        const currentChat = chatStore.currentChat;
        const message = chatStore.messages.find((m) => m.id === data.messageId);

        if (message && currentChat) {
          // Chuyển đổi dữ liệu từ server thành định dạng MessageReaction
          const updatedReactions = data.reactions.map((r) => ({
            userId: r.userId,
            reaction: r.reaction as ReactionType,
            count: r.count || 1, // Sử dụng count từ server hoặc mặc định là 1
          }));

          // Cập nhật tin nhắn với reactions mới
          updateMessage(data.messageId, {
            reactions: updatedReactions,
          });

          // In ra log để debug
          console.log("[SocketProvider] Updated reactions:", updatedReactions);
        }

        // Cập nhật trạng thái người dùng thêm reaction thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());

        // Yêu cầu cập nhật trạng thái của người dùng
        requestUserStatus(socket, data.userId);
      },
    );

    // Handle reaction removal
    socket.on(
      "messageUnReaction",
      (data: {
        messageId: string;
        reactions: Array<{ userId: string; reaction: string; count?: number }>;
        userId: string;
        timestamp: Date;
      }) => {
        console.log("[SocketProvider] Reaction removal received:", data);

        // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
        const chatStore = useChatStore.getState();
        const currentChat = chatStore.currentChat;
        const message = chatStore.messages.find((m) => m.id === data.messageId);

        if (message && currentChat) {
          // Chuyển đổi dữ liệu từ server thành định dạng MessageReaction
          const updatedReactions = data.reactions.map((r) => ({
            userId: r.userId,
            reaction: r.reaction as ReactionType,
            count: r.count || 1, // Sử dụng count từ server hoặc mặc định là 1
          }));

          // Cập nhật tin nhắn với reactions mới
          updateMessage(data.messageId, {
            reactions: updatedReactions,
          });

          // In ra log để debug
          console.log(
            "[SocketProvider] Updated reactions after removal:",
            updatedReactions,
          );
        }

        // Cập nhật trạng thái người dùng bỏ reaction thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());
      },
    );

    // Handle typing status
    socket.on(
      "userTyping",
      (data: {
        userId: string;
        receiverId?: string;
        groupId?: string;
        timestamp: Date;
      }) => {
        console.log("User is typing:", data);

        // Xử lý trạng thái typing cho cả chat screen và conversation list
        const chatStore = useChatStore.getState();
        const currentChat = chatStore.currentChat;
        const conversationsStore = useConversationsStore.getState();

        // Xác định ID của cuộc trò chuyện
        let conversationId = "";
        if (data.groupId) {
          // Nếu là nhóm
          conversationId = data.groupId;
        } else if (data.receiverId === currentUser?.userId) {
          // Nếu người gửi đang nhắn cho mình
          conversationId = data.userId;
        } else if (data.userId === currentUser?.userId) {
          // Nếu mình đang nhắn cho người khác
          conversationId = data.receiverId || "";
        }

        if (conversationId) {
          // Cập nhật trạng thái typing trong conversation list
          conversationsStore.setTypingUser(
            conversationId,
            data.userId,
            new Date(),
          );

          // Kiểm tra xem sự kiện typing có thuộc về cuộc trò chuyện hiện tại không
          const isCurrentUserChat =
            currentChat?.type === "USER" &&
            ((data.receiverId === currentUser?.userId &&
              data.userId === currentChat.id) ||
              (data.userId === currentUser?.userId &&
                data.receiverId === currentChat.id));

          const isCurrentGroupChat =
            currentChat?.type === "GROUP" && data.groupId === currentChat.id;

          // Chỉ cập nhật trạng thái typing trong chat screen nếu đang ở đúng cuộc trò chuyện
          if (isCurrentUserChat || isCurrentGroupChat) {
            setTypingUsers(data);
          }
        }

        // Cập nhật trạng thái người dùng đang nhập thành typing
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "typing", new Date());
      },
    );

    // Handle typing stopped
    socket.on(
      "userTypingStopped",
      (data: { userId: string; receiverId?: string; groupId?: string }) => {
        console.log("User stopped typing:", data);

        // Xử lý trạng thái ngừng typing cho cả chat screen và conversation list
        const chatStore = useChatStore.getState();
        const currentChat = chatStore.currentChat;
        const conversationsStore = useConversationsStore.getState();

        // Xác định ID của cuộc trò chuyện
        let conversationId = "";
        if (data.groupId) {
          // Nếu là nhóm
          conversationId = data.groupId;
        } else if (data.receiverId === currentUser?.userId) {
          // Nếu người gửi đang nhắn cho mình
          conversationId = data.userId;
        } else if (data.userId === currentUser?.userId) {
          // Nếu mình đang nhắn cho người khác
          conversationId = data.receiverId || "";
        }

        if (conversationId) {
          // Xóa trạng thái typing trong conversation list
          conversationsStore.removeTypingUser(conversationId);

          // Kiểm tra xem sự kiện typing có thuộc về cuộc trò chuyện hiện tại không
          const isCurrentUserChat =
            currentChat?.type === "USER" &&
            ((data.receiverId === currentUser?.userId &&
              data.userId === currentChat.id) ||
              (data.userId === currentUser?.userId &&
                data.receiverId === currentChat.id));

          const isCurrentGroupChat =
            currentChat?.type === "GROUP" && data.groupId === currentChat.id;

          // Chỉ cập nhật trạng thái typing trong chat screen nếu đang ở đúng cuộc trò chuyện
          if (isCurrentUserChat || isCurrentGroupChat) {
            removeTypingUser(data.userId);
          }
        }

        // Cập nhật trạng thái người dùng ngừng nhập thành online
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(data.userId, "online", new Date());

        // Yêu cầu cập nhật trạng thái của người dùng
        requestUserStatus(socket, data.userId);
      },
    );

    // Message read status handling has been removed

    // Handle user status changes
    socket.on(
      "userStatus",
      (data: {
        userId: string;
        status: "online" | "offline";
        timestamp: string | Date;
        lastActivity?: string | Date;
      }) => {
        // Chuyển đổi timestamp thành Date object nếu nó là string
        const timestamp =
          typeof data.timestamp === "string"
            ? new Date(data.timestamp)
            : data.timestamp;

        // Chuyển đổi lastActivity thành Date object nếu nó tồn tại và là string
        const lastActivity = data.lastActivity
          ? typeof data.lastActivity === "string"
            ? new Date(data.lastActivity)
            : data.lastActivity
          : timestamp;

        // Cập nhật trạng thái trong store
        const userStatusStore = useUserStatusStore.getState();
        userStatusStore.setUserStatus(
          data.userId,
          data.status,
          timestamp,
          lastActivity,
        );
      },
    );

    // Handle batch user status updates
    socket.on(
      "usersStatus",
      (
        data: Array<{
          userId: string;
          status: "online" | "offline";
          timestamp: string | Date;
          lastActivity?: string | Date;
        }>,
      ) => {
        console.log("Batch user status update received:", data);

        const userStatusStore = useUserStatusStore.getState();

        // Cập nhật trạng thái cho tất cả người dùng trong batch
        data.forEach((user) => {
          const timestamp =
            typeof user.timestamp === "string"
              ? new Date(user.timestamp)
              : user.timestamp;

          const lastActivity = user.lastActivity
            ? typeof user.lastActivity === "string"
              ? new Date(user.lastActivity)
              : user.lastActivity
            : timestamp;

          userStatusStore.setUserStatus(
            user.userId,
            user.status,
            timestamp,
            lastActivity,
          );
        });
      },
    );
  };

  // Hàm yêu cầu trạng thái của một người dùng cụ thể
  const requestUserStatus = (socket: Socket, userId: string) => {
    socket.emit("getUserStatus", { userId });
  };

  // Hàm yêu cầu trạng thái của nhiều người dùng
  const requestMultipleUserStatus = (socket: Socket, userIds: string[]) => {
    if (userIds.length > 0) {
      socket.emit("getUsersStatus", { userIds });
    }
  };

  // Kết nối socket khi đăng nhập thành công
  useEffect(() => {
    if (!currentUser) {
      // Đóng cả hai kết nối nếu không có user
      if (mainSocket) {
        console.log("[SocketProvider] Closing main socket connection");
        mainSocket.disconnect();
        setMainSocket(null);
        setIsMainConnected(false);
      }
      if (messageSocket) {
        console.log("[SocketProvider] Closing message socket connection");
        messageSocket.disconnect();
        setMessageSocket(null);
        setIsMessageConnected(false);
      }
      return;
    }

    console.log("[SocketProvider] Connecting to socket server at:", baseUrl);
    const socketConfig = {
      auth: { userId: currentUser.userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket"],
    };

    // Kết nối main socket
    const main = io(baseUrl, socketConfig);
    setMainSocket(main);
    console.log("socket baseUrl ", baseUrl);
    console.log("socketconfig", socketConfig);

    // Kết nối message socket
    const message = io(`${baseUrl}/message`, socketConfig);
    setMessageSocket(message);

    // Kết nối group socket
    const group = io(`${baseUrl}/groups`, socketConfig);
    setGroupSocket(group);

    // Thiết lập listeners cho main socket
    main.on("connect", () => {
      console.log("[SocketProvider] Main socket connected:", main.id);
      setIsMainConnected(true);

      // Thiết lập heartbeat cho main socket - giảm xuống 15 giây
      const mainHeartbeat = setInterval(() => {
        if (main.connected) {
          main.emit("heartbeat");
        } else {
          clearInterval(mainHeartbeat);
        }
      }, 15000);

      return () => clearInterval(mainHeartbeat);
    });

    // Thiết lập listeners cho message socket
    message.on("connect", () => {
      console.log("[SocketProvider] Message socket connected:", message.id);
      setIsMessageConnected(true);
      setupMessageSocketListeners(message);

      // Thiết lập window.messageSocket để các component khác có thể truy cập
      if (typeof window !== "undefined") {
        window.messageSocket = message;
      }

      // Thiết lập heartbeat cho message socket - giảm xuống 15 giây
      const messageHeartbeat = setInterval(() => {
        if (message.connected) {
          message.emit("heartbeat");
        } else {
          clearInterval(messageHeartbeat);
        }
      }, 15000);

      // Thiết lập cơ chế tự động cập nhật trạng thái người dùng
      const statusUpdateInterval = setInterval(() => {
        if (message.connected) {
          // Lấy danh sách người dùng cần cập nhật trạng thái
          const userStatusStore = useUserStatusStore.getState();
          const userStatuses = userStatusStore.userStatuses;

          // Lấy danh sách người dùng có trạng thái cũ hơn 1 phút
          const now = new Date();
          const userIdsToUpdate: string[] = [];

          userStatuses.forEach((status, userId) => {
            const lastUpdate = status.timestamp;
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffMinutes = diffMs / (1000 * 60);

            // Nếu trạng thái cũ hơn 1 phút, thêm vào danh sách cập nhật
            if (diffMinutes > 1) {
              userIdsToUpdate.push(userId);
            }
          });

          // Yêu cầu cập nhật trạng thái nếu có người dùng cần cập nhật
          if (userIdsToUpdate.length > 0) {
            requestMultipleUserStatus(message, userIdsToUpdate);
          }
        } else {
          clearInterval(statusUpdateInterval);
        }
      }, 60000); // Kiểm tra mỗi 1 phút

      return () => {
        clearInterval(messageHeartbeat);
        clearInterval(statusUpdateInterval);
      };
    });

    // Thiết lập listeners cho group socket
    group.on("connect", () => {
      console.log("[SocketProvider] Group socket connected:", group.id);
      setIsGroupConnected(true);
      setupGroupSocketListeners(group);

      // Gửi một sự kiện heartbeat để kiểm tra kết nối
      group.emit("heartbeat", { timestamp: new Date() }, (response: any) => {
        console.log(
          "[SocketProvider] Group socket heartbeat response:",
          response,
        );
      });

      // Thiết lập window.groupSocket để các component khác có thể truy cập
      if (typeof window !== "undefined") {
        window.groupSocket = group;
      }

      // Lắng nghe tất cả các sự kiện
      group.onAny((event: string, ...args: any[]) => {
        console.log(
          `[SocketProvider] Group socket received event: ${event}`,
          args,
        );
      });

      // Thiết lập heartbeat cho group socket - giảm xuống 15 giây
      const groupHeartbeat = setInterval(() => {
        if (group.connected) {
          group.emit("heartbeat");
        } else {
          clearInterval(groupHeartbeat);
        }
      }, 15000);

      return () => clearInterval(groupHeartbeat);
    });

    // Xử lý disconnect cho cả hai socket
    main.on("disconnect", (reason) => {
      console.log("[SocketProvider] Main socket disconnected:", reason);
      setIsMainConnected(false);
    });

    message.on("disconnect", (reason) => {
      console.log("[SocketProvider] Message socket disconnected:", reason);
      setIsMessageConnected(false);
    });

    group.on("disconnect", (reason) => {
      console.log("[SocketProvider] Group socket disconnected:", reason);
      setIsGroupConnected(false);
    });

    // Xử lý lỗi kết nối
    main.on("connect_error", (error) => {
      console.error("[SocketProvider] Main socket connection error:", error);
      setIsMainConnected(false);
    });

    message.on("connect_error", (error) => {
      console.error("[SocketProvider] Message socket connection error:", error);
      setIsMessageConnected(false);
    });

    group.on("connect_error", (error) => {
      console.error(
        "[SocketProvider] Group socket connection error:",
        error.message,
      );
      console.error(
        "[SocketProvider] Group socket connection error details:",
        error,
      );
      setIsGroupConnected(false);
    });

    // Lắng nghe sự kiện lỗi
    group.on("error", (error) => {
      console.error("[SocketProvider] Group socket error:", error);
    });

    // Cleanup khi unmount
    return () => {
      console.log("[SocketProvider] Cleaning up socket connections");
      main.removeAllListeners();
      message.removeAllListeners();
      group.removeAllListeners();
      main.disconnect();
      message.disconnect();
      group.disconnect();
    };
  }, [currentUser]);

  // Hàm reload danh sách cuộc trò chuyện
  const reloadConversationList = () => {
    try {
      const conversationsStore = useConversationsStore.getState();
      console.log("[SocketProvider] Reloading conversation list");
      conversationsStore.fetchConversations(1);
    } catch (error) {
      console.error(
        "[SocketProvider] Error reloading conversation list:",
        error,
      );
    }
  };

  // Hàm để kết nối lại message socket
  const reconnectMessageSocket = () => {
    console.log(
      "[SocketProvider] Reconnecting message socket after group creation",
    );

    if (!currentUser) {
      console.log("[SocketProvider] Cannot reconnect: No current user");
      return;
    }

    // Đóng kết nối hiện tại nếu có
    if (messageSocket) {
      console.log(
        "[SocketProvider] Closing existing message socket connection",
      );
      messageSocket.disconnect();
    }

    const socketConfig = {
      auth: { userId: currentUser.userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket"],
    };

    // Kết nối message socket mới
    console.log("[SocketProvider] Creating new message socket connection");
    const message = io(`${baseUrl}/message`, socketConfig);

    // Thiết lập listeners cho message socket
    message.on("connect", () => {
      console.log("[SocketProvider] New message socket connected:", message.id);
      setIsMessageConnected(true);
      setupMessageSocketListeners(message);

      // Thiết lập window.messageSocket để các component khác có thể truy cập
      if (typeof window !== "undefined") {
        window.messageSocket = message;
      }

      // Cập nhật danh sách cuộc trò chuyện
      reloadConversationList();
    });

    message.on("disconnect", (reason) => {
      console.log("[SocketProvider] New message socket disconnected:", reason);
      setIsMessageConnected(false);
    });

    message.on("connect_error", (error) => {
      console.error(
        "[SocketProvider] New message socket connection error:",
        error,
      );
      setIsMessageConnected(false);
    });

    // Cập nhật state với socket mới
    setMessageSocket(message);
  };

  return (
    <SocketContext.Provider
      value={{
        mainSocket,
        messageSocket,
        groupSocket,
        isMainConnected,
        isMessageConnected,
        isGroupConnected,
        reconnectMessageSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// Type declaration for window object
declare global {
  interface Window {
    mainSocket: Socket | null;
    messageSocket: Socket | null;
    groupSocket: Socket | null;
  }
}
