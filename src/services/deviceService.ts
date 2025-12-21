import { api } from './api';
import type { Device } from '@/components/model/Device';
import type { ScanConfig } from '@/components/model/dto/ScanConfig';

const ENDPOINT = '/devices';

export const deviceService = {

    getDevices: async () => {
    return await api.get<Device[]>(ENDPOINT); 
  },

  scanInterfaces: async() => {   
    return await api.get<string[]>(`${ENDPOINT}/interfaces`);
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
  }


}