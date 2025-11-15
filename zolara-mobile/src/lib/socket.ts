import { useAuthStore } from "@/src/store/authStore";
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import axiosInstance from "./axios";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;
  private baseUrl = process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.split("/api/v1")[0]
    : "https://api.bondhub.cloud";

  constructor() {
    console.log("Socket using base URL:", this.baseUrl);
  }

  public async connect() {
    if (this.socket && this.socket.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      if (!token || !deviceId) {
        console.log("Missing credentials for socket connection");
        return null;
      }

      console.log("Connecting to socket with token and deviceId");

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Create socket connection
      this.socket = io(this.baseUrl, {
        auth: {
          token,
          deviceId,
        },
        transports: ["websocket", "polling"],
        path: "/socket.io",
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error("Socket connection error:", error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      if (!refreshToken) {
        console.error("No refresh token available");
        return null;
      }

      console.log("Attempting to refresh token for socket...");
      const response = await axiosInstance.post(
        `${this.baseUrl}/api/v1/auth/refresh`,
        {
          refreshToken,
          deviceId,
        },
      );

      const { accessToken } = response.data;
      await SecureStore.setItemAsync("accessToken", accessToken);
      console.log("Token refreshed successfully");
      return accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  private async handleTokenExpiration(): Promise<boolean> {
    const newToken = await this.refreshToken();
    if (newToken && this.socket) {
      this.socket.auth = {
        token: newToken,
        deviceId: await SecureStore.getItemAsync("deviceId"),
      };
      this.socket.connect();
      return true;
    }
    return false;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.connectionAttempts = 0;
    });

    this.socket.on("disconnect", async (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect" || reason === "transport close") {
        const reconnected = await this.handleTokenExpiration();
        if (!reconnected) {
          console.log("Failed to reconnect, clearing socket instance");
          this.socket = null;
        }
      }
    });

    this.socket.on("connect_error", async (error) => {
      console.error("Connection error:", error.message);
      if (
        error.message.includes("authentication") ||
        error.message.includes("401")
      ) {
        const reconnected = await this.handleTokenExpiration();
        if (!reconnected) {
          this.socket = null;
          const { logout } = useAuthStore.getState();
          await logout();
        }
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting reconnection:", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect to socket server");
      // Try to create a new connection after reconnection fails
      setTimeout(() => this.connect(), 2000);
    });

    this.socket.on("forceLogout", async () => {
      console.log("Received force logout event");
      const { logout } = useAuthStore.getState();
      await logout();
      this.disconnect();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  public disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Method to connect to a specific namespace
  public async connectToNamespace(namespace: string) {
    try {
      // Ensure base connection exists
      if (!this.socket) {
        await this.connect();
      }

      const token = await SecureStore.getItemAsync("accessToken");
      const deviceId = await SecureStore.getItemAsync("deviceId");

      // if (!token) {
      //   console.error("No access token available for namespace connection");
      //   return null;
      // }

      // Lấy userId từ store
      const { user } = useAuthStore.getState();
      const userId = user?.userId;

      console.log(
        `Connecting to namespace: ${namespace} with userId: ${userId}`,
      );
      const namespaceSocket = io(`${this.baseUrl}/${namespace}`, {
        auth: {
          token,
          deviceId,
          userId, // Thêm userId vào auth để backend có thể xác định người dùng
        },
        query: {
          userId, // Thêm userId vào query params cũng để đề phòng
        },
        transports: ["websocket", "polling"],
        path: "/socket.io", // Remove the API prefix
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      // Setup basic event listeners for the namespace socket
      namespaceSocket.on("connect", () => {
        console.log(`Connected to namespace: ${namespace}`);
      });

      namespaceSocket.on("connect_error", (error) => {
        console.error(
          `Namespace ${namespace} connection error:`,
          error.message,
        );
      });

      namespaceSocket.on("disconnect", (reason) => {
        console.log(`Namespace ${namespace} disconnected:`, reason);
      });

      return namespaceSocket;
    } catch (error) {
      console.error(`Error connecting to namespace ${namespace}:`, error);
      return null;
    }
  }
}

export const socketManager = SocketManager.getInstance();
