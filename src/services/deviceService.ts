import { api } from './api';
import type { Device } from '@/components/model/Device';
import type { ScanConfig } from '@/components/model/dto/ScanConfig';
import type { NetworkInterface } from '@/components/model/dto/NetworkInterface';
import type { DeviceInfo } from '@/components/model/dto/DeviceInfo';
import type { ApiResponse } from '@/components/model/dto/ApiResponse';

const ENDPOINT = '/devices';

export const deviceService = {

  getDevices: async (): Promise<Device[]> => {
    const response = await api.get<Device[]>(ENDPOINT) as unknown as ApiResponse<Device[]>;
    return response.data;
  },

  scanInterfaces: async(): Promise<NetworkInterface[]> => {
    const response = await api.get(`${ENDPOINT}/interfaces`) as unknown as ApiResponse<NetworkInterface[]>;
    return response.data;
  },

  scan: async (theScanConfig: ScanConfig) => {
    const response = await api.post(`${ENDPOINT}/scan`, theScanConfig);
    return response.data
  },

  ping: async (ip: string) => {
    try {
        const response = await api.get(`${ENDPOINT}/ping?ip=${ip}`) as unknown as ApiResponse<{ success: boolean }>;
        return response.success;
    } catch {
        return false;
    }
  },

  addByIp: async (ip: string, username: string, password: string) => {
        return await api.post(`${ENDPOINT}/manual`, { ip, username, password });
    },

  uploadUsers: async (deviceIndex: number) => {
      return await api.post(`${ENDPOINT}/${deviceIndex}/upload-users`);
  },

  downloadLogs: async (deviceIndex: number) => {
      return await api.post(`${ENDPOINT}/${deviceIndex}/logs`);
  },

  getDeviceInfo: async (ip: string): Promise<DeviceInfo> => {
    const response = await api.get<DeviceInfo>(`${ENDPOINT}/info?ip=${ip}`) as unknown as ApiResponse<DeviceInfo>;
      return response.data;
  },

  unlock: async (ip: string, username: string, password: string) => {
    const response = await api.post(`${ENDPOINT}/unlock`, { ip, username, password }) as unknown as ApiResponse<{ success: boolean }>;
      return response.success;
  },

  lock: async (ip: string) => {
    const response = await api.post(`${ENDPOINT}/lock`, { ip }) as unknown as ApiResponse<{ success: boolean }>;
      return response.success;
  },

  cancelScan: async () => {
    return await api.post(`${ENDPOINT}/scan/cancel`);
  },

  // isDeviceUnlocked: async (ip: string): Promise<boolean> => {
  //   const response = await api.get<{ unlocked: boolean }>(`${ENDPOINT}/auth-status?ip=${ip}`) as unknown as ApiResponse<{ unlocked: boolean }>;
  //   return response.data.unlocked;
  // }


}