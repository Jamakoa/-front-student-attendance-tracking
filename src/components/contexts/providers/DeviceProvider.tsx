import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { DeviceContext } from "../DeviceContext";
import type { Device } from "@/components/model/Device";
import { deviceService } from "@/services/deviceService";
import type { NetworkInterface } from "@/components/model/dto/NetworkInterface";
import type { ScanConfig } from "@/components/model/dto/ScanConfig"; // Nouvel import nécessaire

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [listsInterfaces, setListsInterfaces] = useState<NetworkInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Nouvel état pour savoir si un scan est en cours globalement
  const [isScanning, setIsScanning] = useState(false);

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

  // 3. NOUVELLE FONCTION : Centralisation de la logique de Scan
  const scanNetwork = useCallback(async (config: ScanConfig) => {
    setIsScanning(true);
    try {
      // Appel API via le service
      await deviceService.scan(config);
      
      // Une fois le scan terminé, on rafraîchit automatiquement la liste
      await refreshDevices();
      
      return true; // Indique que tout s'est bien passé
    } catch (error) {
      console.error("Erreur durant le scan", error);
      return false; // Indique une erreur
    } finally {
      setIsScanning(false);
    }
  }, [refreshDevices]);

  useEffect(() => {
      refreshDevices();
      refreshInterfaces();
  }, [refreshDevices, refreshInterfaces]);

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      listsInterfaces, 
      isLoading,
      isScanning,     // On expose l'état du scan
      scanNetwork,    // On expose la fonction de scan
      refreshInterfaces, 
      refreshDevices 
    }}>
      {children}
    </DeviceContext.Provider>
  );
}