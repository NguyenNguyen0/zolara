import axiosInstance from "@/lib/axios";
import { socketManager } from "@/lib/socket";
import { Socket } from "socket.io-client";

export type CallType = "AUDIO" | "VIDEO";
export type CallStatus =
  | "RINGING"
  | "ONGOING"
  | "ENDED"
  | "MISSED"
  | "REJECTED";

export interface Call {
  id: string;
  initiatorId: string;
  receiverId?: string;
  groupId?: string;
  type: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  roomId: string;
  participants: any[];
}

class CallService {
  private socket: Socket | null = null;

  async createCall(initiatorId: string, receiverId: string, type: CallType) {
    const res = await axiosInstance.post("/calls", {
      initiatorId,
      receiverId,
      type,
    });
    return res.data as Call;
  }

  async joinCall(callId: string, userId: string) {
    const res = await axiosInstance.post("/calls/join", {
      callId,
      userId,
    });
    return res.data;
  }

  async endCall(callId: string, userId: string) {
    const res = await axiosInstance.post("/calls/end", {
      callId,
      userId,
    });
    return res.data;
  }

  async rejectCall(callId: string) {
    const res = await axiosInstance.post(`/calls/${callId}/reject`);
    return res.data;
  }

  async connectSocket() {
    if (this.socket && this.socket.connected) return this.socket;
    this.socket = await socketManager.connectToNamespace("call");
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.socket?.off(event, handler);
  }

  emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }

  // Khung cho tích hợp WebRTC (mediasoup-client)
  // async setupWebRTC(...) {}
}

export const callService = new CallService();
