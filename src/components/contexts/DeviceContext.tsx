import { createContext } from "react";
import type { Device } from "@/components/model/Device";
import type { NetworkInterface } from "../model/dto/NetworkInterface";

interface DeviceContextType {
  devices: Device[];
  listsInterfaces: NetworkInterface[];
  refreshDevices: () => Promise<void>;
  refreshInterfaces: () => Promise<void>;
  isLoading?: boolean;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

