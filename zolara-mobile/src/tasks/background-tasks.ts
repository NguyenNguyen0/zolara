import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { notificationService } from "@/services/notification-service";
import { useAuthStore } from "@/store/authStore";
// import axiosInstance from '@/lib/axios'; // Không cần thiết vì chúng ta không gọi API

// Define task names
export const BACKGROUND_FETCH_TASK = "BACKGROUND-FETCH-TASK";

// Register the background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Get the current user from storage
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("No user logged in, cannot fetch messages");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Giả lập việc lấy tin nhắn chưa đọc từ server
    // Trong thực tế, bạn sẽ gọi API thực của mình ở đây
    console.log("Background task: checking for unread messages");

    // Mô phỏng không có tin nhắn mới
    const unreadMessages: any[] = [];

    if (unreadMessages && unreadMessages.length > 0) {
      // Create notifications for each unread message
      for (const message of unreadMessages) {
        await notificationService.createMessageNotification(message);
      }

      // Update badge count
      const currentBadgeCount = await notificationService.getBadgeCount();
      await notificationService.setBadgeCount(
        currentBadgeCount + unreadMessages.length,
      );

      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Error in background fetch task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export async function registerBackgroundFetchTask() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("Background fetch task registered");
  } catch (error) {
    console.error("Error registering background fetch task:", error);
  }
}

// Unregister the background fetch task
export async function unregisterBackgroundFetchTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log("Background fetch task unregistered");
  } catch (error) {
    console.error("Error unregistering background fetch task:", error);
  }
}

// Check if the background fetch task is registered
export async function isBackgroundFetchTaskRegistered() {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK,
    );

    return {
      status,
      isRegistered,
    };
  } catch (error) {
    console.error("Error checking background fetch task status:", error);
    return {
      status: BackgroundFetch.BackgroundFetchStatus.Denied,
      isRegistered: false,
    };
  }
}
