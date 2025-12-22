import { createContext } from "react";
import type { Device } from "@/components/model/Device";
import type { NetworkInterface } from "../model/dto/NetworkInterface";
import type { ScanConfig } from "../model/dto/ScanConfig";
import type { FrontEndSession } from "../model/dto/FrontEndSession";

interface DeviceContextType {
  // Données
  devices: Device[];
  isLoading: boolean;
  isScanning: boolean;
  listsInterfaces: NetworkInterface[];
  sessions: Record<string, FrontEndSession>;

  // Actions
  refreshDevices: () => Promise<void>;
  refreshInterfaces: () => Promise<void>;
  lockDevice: (ip: string) => Promise<void>;
  isDeviceUnlocked: (ip: string) => boolean;
  cancelScan: () => void;
  scanNetwork: (config: ScanConfig) => Promise<boolean>;
  unlockDevice: (ip: string, user: string, pass: string) => Promise<boolean>;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);