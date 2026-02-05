import { registerPlugin } from '@capacitor/core';

export interface VPNPluginInterface {
  connect(options: { config: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  getStatus(): Promise<{ connected: boolean; bytesReceived: number; bytesSent: number }>;
}

const VPNPlugin = registerPlugin<VPNPluginInterface>('VPNPlugin', {
  web: () => ({
    async connect() {
      console.log('VPN connect called on web - use native app');
      return { success: false };
    },
    async disconnect() {
      console.log('VPN disconnect called on web - use native app');
      return { success: false };
    },
    async getStatus() {
      return { connected: false, bytesReceived: 0, bytesSent: 0 };
    }
  })
});

export { VPNPlugin };
