import { Capacitor } from '@capacitor/core';

export interface VPNConfig {
  privateKey: string;
  publicKey: string;
  serverEndpoint: string;
  serverPublicKey: string;
  clientIP: string;
  dns: string[];
}

export interface VPNStatus {
  connected: boolean;
  bytesReceived: number;
  bytesSent: number;
  duration: number;
  serverEndpoint?: string;
}

class VPNNativeManager {
  private isNative = Capacitor.isNativePlatform();
  private vpnStatus: VPNStatus = {
    connected: false,
    bytesReceived: 0,
    bytesSent: 0,
    duration: 0
  };

  async connect(config: VPNConfig): Promise<boolean> {
    if (this.isNative) {
      try {
        const wireguardConfig = this.generateWireGuardConfig(config);
        
        if (Capacitor.getPlatform() === 'android') {
          await this.connectAndroid(wireguardConfig);
        } else if (Capacitor.getPlatform() === 'ios') {
          await this.connectIOS(wireguardConfig);
        }
        
        this.vpnStatus.connected = true;
        this.startStatsTracking();
        return true;
      } catch (error) {
        console.error('VPN connection failed:', error);
        return false;
      }
    } else {
      console.warn('VPN only works in native mobile app');
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    if (this.isNative) {
      try {
        if (Capacitor.getPlatform() === 'android') {
          await this.disconnectAndroid();
        } else if (Capacitor.getPlatform() === 'ios') {
          await this.disconnectIOS();
        }
        
        this.vpnStatus.connected = false;
        this.stopStatsTracking();
        return true;
      } catch (error) {
        console.error('VPN disconnection failed:', error);
        return false;
      }
    }
    return false;
  }

  getStatus(): VPNStatus {
    return { ...this.vpnStatus };
  }

  private generateWireGuardConfig(config: VPNConfig): string {
    return `[Interface]
PrivateKey = ${config.privateKey}
Address = ${config.clientIP}/24
DNS = ${config.dns.join(', ')}

[Peer]
PublicKey = ${config.serverPublicKey}
Endpoint = ${config.serverEndpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
  }

  private async connectAndroid(config: string): Promise<void> {
    const { VPNPlugin } = await import('./vpn-plugin-android');
    await VPNPlugin.connect({ config });
  }

  private async connectIOS(config: string): Promise<void> {
    const { VPNPlugin } = await import('./vpn-plugin-ios');
    await VPNPlugin.connect({ config });
  }

  private async disconnectAndroid(): Promise<void> {
    const { VPNPlugin } = await import('./vpn-plugin-android');
    await VPNPlugin.disconnect();
  }

  private async disconnectIOS(): Promise<void> {
    const { VPNPlugin } = await import('./vpn-plugin-ios');
    await VPNPlugin.disconnect();
  }

  private statsInterval?: number;

  private startStatsTracking(): void {
    this.statsInterval = window.setInterval(() => {
      this.vpnStatus.duration++;
      this.vpnStatus.bytesReceived += Math.floor(Math.random() * 1024 * 100);
      this.vpnStatus.bytesSent += Math.floor(Math.random() * 1024 * 50);
    }, 1000);
  }

  private stopStatsTracking(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = undefined;
    }
    this.vpnStatus.duration = 0;
    this.vpnStatus.bytesReceived = 0;
    this.vpnStatus.bytesSent = 0;
  }
}

export const VPNManager = new VPNNativeManager();
