import AgoraRTC, { type IAgoraRTCClient, type ICameraVideoTrack, type IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  certificate?: string;
}

export interface AgoraTokenResponse {
  token: string;
  uid: number;
}

class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private config: AgoraConfig;

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_AGORA_APP_ID || '',
      certificate: import.meta.env.VITE_AGORA_APP_CERTIFICATE || '',
    };

    if (!this.config.appId) {
      console.error('Agora App ID is required. Please set VITE_AGORA_APP_ID in your environment variables.');
    }
  }

  // Initialize Agora client
  public async initializeClient(): Promise<IAgoraRTCClient> {
    if (!this.client) {
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return this.client;
  }

  // Join a channel
  public async joinChannel(channelName: string, token: string | null = null, uid: number | null = null): Promise<number | string> {
    try {
      if (!this.client) {
        await this.initializeClient();
      }

      const joinedUid = await this.client!.join(
        this.config.appId,
        channelName,
        token,
        uid
      );

      console.log('Successfully joined channel:', channelName, 'with uid:', joinedUid);
      return joinedUid;
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  // Leave channel
  public async leaveChannel(): Promise<void> {
    try {
      if (this.client) {
        await this.client.leave();
        console.log('Left channel successfully');
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  // Create local video track
  public async createVideoTrack(): Promise<ICameraVideoTrack> {
    try {
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      return this.localVideoTrack;
    } catch (error) {
      console.error('Failed to create video track:', error);
      throw error;
    }
  }

  // Create local audio track
  public async createAudioTrack(): Promise<IMicrophoneAudioTrack> {
    try {
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      return this.localAudioTrack;
    } catch (error) {
      console.error('Failed to create audio track:', error);
      throw error;
    }
  }

  // Publish local tracks
  public async publishTracks(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      const tracks = [];
      if (this.localVideoTrack) tracks.push(this.localVideoTrack);
      if (this.localAudioTrack) tracks.push(this.localAudioTrack);

      if (tracks.length > 0) {
        await this.client.publish(tracks);
        console.log('Published local tracks successfully');
      }
    } catch (error) {
      console.error('Failed to publish tracks:', error);
      throw error;
    }
  }

  // Unpublish local tracks
  public async unpublishTracks(): Promise<void> {
    try {
      if (!this.client) return;

      const tracks = [];
      if (this.localVideoTrack) tracks.push(this.localVideoTrack);
      if (this.localAudioTrack) tracks.push(this.localAudioTrack);

      if (tracks.length > 0) {
        await this.client.unpublish(tracks);
        console.log('Unpublished local tracks successfully');
      }
    } catch (error) {
      console.error('Failed to unpublish tracks:', error);
      throw error;
    }
  }

  // Clean up resources
  public async cleanup(): Promise<void> {
    try {
      await this.unpublishTracks();

      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      await this.leaveChannel();
      this.client = null;

      console.log('Agora resources cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup Agora resources:', error);
      throw error;
    }
  }

  // Get channel statistics (for admin dashboard)
  public async getChannelStats() {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      const stats = await this.client.getRTCStats();
      return {
        duration: stats.Duration,
        userCount: stats.UserCount,
        receiveBitrate: stats.RecvBitrate,
        sendBitrate: stats.SendBitrate,
        outgoingAvailableBandwidth: stats.OutgoingAvailableBandwidth,
      };
    } catch (error) {
      console.error('Failed to get channel stats:', error);
      throw error;
    }
  }

  // Get client instance
  public getClient(): IAgoraRTCClient | null {
    return this.client;
  }

  // Get config
  public getConfig(): AgoraConfig {
    return this.config;
  }
}

// Export singleton instance
export const agoraService = new AgoraService();
export default agoraService;
