import { useEffect, useState } from "react";
import { socketManager } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook to manage socket connections
 * @param namespace Optional namespace to connect to
 * @returns Object containing socket instance and connection status
 */
export const useSocket = (namespace?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let socketInstance: Socket | null = null;

    const connectSocket = async () => {
      try {
        if (!isAuthenticated) {
          console.log("Not authenticated, skipping socket connection");
          return;
        }

        setError(null);

        if (namespace) {
          console.log(`Connecting to namespace: ${namespace}`);
          socketInstance = await socketManager.connectToNamespace(namespace);
        } else {
          console.log("Connecting to main socket");
          socketInstance = ((await socketManager.connect()) as Socket) || null;
        }

        if (!socketInstance) {
          if (isMounted) {
            setError("Failed to initialize socket");
          }
          return;
        }

        if (isMounted) {
          setSocket(socketInstance);
          setIsConnected(socketInstance.connected);
        }

        socketInstance.on("connect", () => {
          if (isMounted) {
            console.log(
              `Socket${namespace ? ` (${namespace})` : ""} connected`,
            );
            setIsConnected(true);
            setError(null);
          }
        });

        socketInstance.on("disconnect", () => {
          if (isMounted) {
            console.log(
              `Socket${namespace ? ` (${namespace})` : ""} disconnected`,
            );
            setIsConnected(false);
          }
        });

        socketInstance.on("connect_error", (err) => {
          if (isMounted) {
            console.error(
              `Socket${namespace ? ` (${namespace})` : ""} connection error:`,
              err.message,
            );
            setError(err.message);
          }
        });
      } catch (err) {
        if (isMounted) {
          console.error("Error in useSocket hook:", err);
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    connectSocket();

    // Cleanup function
    return () => {
      isMounted = false;
      if (socketInstance && namespace) {
        console.log(`Disconnecting from namespace: ${namespace}`);
        socketInstance.disconnect();
      }
    };
  }, [namespace, isAuthenticated]);

  return { socket, isConnected, error };
};
