import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { DeviceContext } from "../DeviceContext";
import type { Device } from "@/components/model/Device";
import { deviceService } from "@/services/deviceService";
import type { NetworkInterface } from "@/components/model/dto/NetworkInterface";

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [listsInterfaces, setListsInterfaces] = useState<NetworkInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDevices = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await deviceService.getDevices();
        if (Array.isArray(response)) {
          setDevices(response);
        } else {
          setDevices([]);
        }
      } catch (error) {
        console.error("Erreur chargement devices", error);
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
  }, []);
  

  // 2. Charger les Interfaces Réseaux
  const refreshInterfaces = useCallback(async () => {
    try {
      const interfaces = await deviceService.scanInterfaces();
      setListsInterfaces(Array.isArray(interfaces) ? interfaces : []);
    } catch {
        console.warn("Backend inaccessible : Reset des interfaces.");
        setListsInterfaces([]);

    }
  }, []);

  useEffect(() => {
      refreshDevices();
      refreshInterfaces();
  }, [refreshDevices, refreshInterfaces]);

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      listsInterfaces, 
      isLoading, 
      refreshInterfaces, 
      refreshDevices 
    }}>
      {children}
    </DeviceContext.Provider>
  );
}