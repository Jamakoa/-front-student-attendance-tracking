import { api } from './api';
import type { Device } from '@/components/model/Device';
import type { ScanConfig } from '@/components/model/dto/ScanConfig';
import type { NetworkInterface } from '@/components/model/dto/NetworkInterface';
import type { DeviceInfo } from '@/components/model/dto/DeviceInfo';

const ENDPOINT = '/devices';

export const deviceService = {

  getDevices: async (): Promise<Device[]> => {
    return await api.get<Device[]>(ENDPOINT) as unknown as Device[]; 
  },

  scanInterfaces: async(): Promise<NetworkInterface[]> => {   
    return await api.get<string[]>(`${ENDPOINT}/interfaces`) as unknown as NetworkInterface[];
  },

  scan: async (theScanConfig: ScanConfig) => {

    return await api.post(`${ENDPOINT}/scan`, theScanConfig);
  },

  ping: async (ip: string) => {
        try {
            await api.get(`${ENDPOINT}/ping?ip=${ip}`);
            return true;
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
      return await api.get<DeviceInfo>(`${ENDPOINT}/info?ip=${ip}`) as unknown as DeviceInfo;
  },

  unlock: async (ip: string, username: string, password: string) => {
      return await api.post(`${ENDPOINT}/unlock`, { ip, username, password });
  },

  lock: async (ip: string) => {
      return await api.post(`${ENDPOINT}/lock`, { ip });
  }


}