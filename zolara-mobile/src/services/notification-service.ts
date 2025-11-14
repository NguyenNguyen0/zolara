import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as TaskManager from "expo-task-manager";
// import axiosInstance from '@/lib/axios'; // Không cần thiết vì chúng ta không gọi API

// Define the background task name
export const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show notification as a banner
    shouldShowList: true, // Show notification in the list
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register the background task
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error(`Error in background task: ${error}`);
      return;
    }

    if (data) {
      // Handle the notification data
      const { notification } = data as {
        notification: Notifications.Notification;
      };
      console.log("Received notification in background:", notification);

      // You can perform actions here like updating local storage
      // But remember this runs in the background, so React context is not available
    }
  },
);

export const notificationService = {
  // Register for push notifications
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    // Check if this is a physical device (not a simulator/emulator)
    if (Device.isDevice) {
      // Check if we have permission to send notifications
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If we don't have permission, ask for it
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If we still don't have permission, we can't send notifications
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      // Get the token that uniquely identifies this device
      token = await this.getExpoPushToken();
      console.log("Expo push token:", token);
    } else {
      console.log("Must use physical device for push notifications");
    }

    // Set up special notification channel for Android
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  },

  // Get the Expo push token
  async getExpoPushToken(): Promise<string> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      // Get the token
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token;
    } catch (error) {
      console.error("Error getting Expo push token:", error);
      throw error;
    }
  },

  // Send the push token to the server
  async sendPushTokenToServer(token: string, _userId: string): Promise<void> {
    // Lưu token vào bộ nhớ cục bộ thay vì gửi lên server
    try {
      console.log("Push token generated:", token);
      console.log("This would normally be sent to the server");

      // Nếu sau này bạn có API để lưu token, bạn có thể thêm code ở đây:
      // await axiosInstance.post('/your-actual-api-endpoint', {
      //   userId,
      //   token,
      //   deviceType: Platform.OS.toUpperCase(),
      // });
    } catch (error) {
      console.error("Error handling push token:", error);
    }
  },

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: null, // null means show immediately
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling local notification:", error);
      throw error;
    }
  },

  // Create a notification for a new message
  async createMessageNotification(message: any): Promise<void> {
    try {
      // Determine the notification content based on message type
      let title = "";
      let body = "";

      if (message.messageType === "USER") {
        // For direct messages
        title = message.senderName || "Tin nhắn mới";
        body = message.content.text || "Đã gửi một tin nhắn";
      } else if (message.messageType === "GROUP") {
        // For group messages
        title = message.groupName || "Tin nhắn nhóm mới";
        body = `${message.senderName || "Ai đó"}: ${message.content.text || "Đã gửi một tin nhắn"}`;
      }

      // If the message has media but no text
      if (
        !message.content.text &&
        message.content.media &&
        message.content.media.length > 0
      ) {
        const mediaType = message.content.media[0].type;

        if (mediaType === "IMAGE") {
          body = "Đã gửi một hình ảnh";
        } else if (mediaType === "VIDEO") {
          body = "Đã gửi một video";
        } else if (mediaType === "DOCUMENT") {
          body = "Đã gửi một tài liệu";
        } else {
          body = "Đã gửi một file đính kèm";
        }
      }

      // Schedule the notification
      await this.scheduleLocalNotification(title, body, {
        messageId: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        messageType: message.messageType,
        groupId: message.groupId,
        groupName: message.groupName,
      });
    } catch (error) {
      console.error("Error creating message notification:", error);
    }
  },

  // Remove all delivered notifications
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error dismissing all notifications:", error);
    }
  },

  // Get the badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("Error getting badge count:", error);
      return 0;
    }
  },

  // Set the badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  },
};
