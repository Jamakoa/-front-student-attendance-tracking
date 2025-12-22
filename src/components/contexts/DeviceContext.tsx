import { createContext } from "react";
import type { Device } from "@/components/model/Device";
import type { NetworkInterface } from "../model/dto/NetworkInterface";
import type { ScanConfig } from "../model/dto/ScanConfig"; // Nouvel import nécessaire

interface DeviceContextType {
  // Données
  devices: Device[];
  listsInterfaces: NetworkInterface[];
  isLoading: boolean;
  isScanning: boolean;

  // Actions
  refreshDevices: () => Promise<void>;
  refreshInterfaces: () => Promise<void>;
  scanNetwork: (config: ScanConfig) => Promise<boolean>;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);