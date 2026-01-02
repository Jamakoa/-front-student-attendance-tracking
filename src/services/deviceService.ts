import { api } from './api';
import type { Device } from '@/components/model/Device';
import type { ScanConfig } from '@/components/model/dto/ScanConfig';
import type { NetworkInterface } from '@/components/model/dto/NetworkInterface';
import type { DeviceInfo } from '@/components/model/dto/DeviceInfo';
import type { ApiResponse } from '@/components/model/dto/ApiResponse';
import type { DeviceUser } from '@/components/model/dto/DeviceUser';
import type { DeviceLog } from '@/components/model/dto/DeviceLog';

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

  getDeviceUsers: async (ip: string, offset: number, limit: number): Promise<DeviceUser[]> => {
      const response = await api.get(`${ENDPOINT}/users?ip=${ip}&offset=${offset}&limit=${limit}`) as unknown as ApiResponse<DeviceUser[]>;
      return response.data;
  },

  // src/services/deviceService.ts

  getDeviceLogs: async (
    ip: string, startTime: string, endTime: string, majorType: number, minorType: number, 
    searchQuery: string
  ): Promise<DeviceLog[]> => {
      const params = new URLSearchParams();
      params.append('ip', ip);
      params.append('startTime', startTime);
      params.append('endTime', endTime);

      // 1. Type d'Événement (Major)
      if (majorType !== 0) {
          params.append('majorType', majorType.toString());
      } else {
          // Si "Tous", on demande souvent le type 5 par défaut ou on n'envoie rien (selon ton backend)
          // params.append('majorType', '5'); 
      }

      // 2. Détail (Minor)
      if (minorType !== -1) {
          params.append('minorType', minorType.toString());
      }

      // 3. Recherche (Matricule ou Nom)
      if (searchQuery) {
          // Le backend devra faire un "WHERE employeeNo LIKE %q% OR name LIKE %q%"
          params.append('searchQuery', searchQuery); 
      }

      console.log(params);

      const response = await api.get(`${ENDPOINT}/events?${params.toString()}`) as unknown as ApiResponse<DeviceLog[]>;
      return response.data;
  },

  importUsersFromDevice: async (ip: string, userIds: string[]) => {
      // Ici tu feras : await api.post('/devices/import-users', { ip, userIds });
      console.log(`Importing users from ${ip}:`, userIds);
      return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation
  }

}