import type { ReactNode } from "react";
import { DeviceContext } from "../DeviceContext";
import { useState, useCallback, useEffect } from "react";
import type { Device } from "@/components/model/Device";
import { deviceService } from "@/services/deviceService";
import type { ScanConfig } from "@/components/model/dto/ScanConfig";
import type { FrontEndSession } from "@/components/model/dto/FrontEndSession";
import type { NetworkInterface } from "@/components/model/dto/NetworkInterface";

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [listsInterfaces, setListsInterfaces] = useState<NetworkInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Nouvel état pour savoir si un scan est en cours globalement
  const [isScanning, setIsScanning] = useState(false);

  const [sessions, setSessions] = useState<Record<string, FrontEndSession>>({});

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

  // Unlock device function
  const unlockDevice = useCallback(async (ip: string, username: string, pass: string) => {
    try {
        // On demande au Backend de vérifier et stocker la session
        await deviceService.unlock(ip, username, pass);
        
        // Si pas d'erreur, on met à jour l'UI
        setSessions(prev => ({
            ...prev,
            [ip]: { ip, username, isAuthenticated: true }
        }));
        return true;
    } catch (error) {
        console.error("Erreur authentification:", error);
        throw error;
    }
  }, []);

  // Lock device function
  const lockDevice = useCallback(async (ip: string) => {
    try {
        await deviceService.lock(ip);
        // On retire la session locale
        setSessions(prev => {
            const newSessions = { ...prev };
            delete newSessions[ip];
            return newSessions;
        });
    } catch (error) {
        console.error("Erreur lors du verrouillage", error);
    }
  }, []);

  // 3. Helper for l'UI
  const isDeviceUnlocked = useCallback((ip: string) => {
      return !!sessions[ip]?.isAuthenticated;
  }, [sessions]);

  useEffect(() => {
      refreshDevices();
      refreshInterfaces();
  }, [refreshDevices, refreshInterfaces]);

  return (
    <DeviceContext.Provider value={{ 
      devices, 
      listsInterfaces, 
      isLoading,
      isScanning,
      sessions,         // On expose les sessions
      unlockDevice,     // On expose
      lockDevice,       // On expose
      isDeviceUnlocked, // On expose
      scanNetwork,    
      refreshInterfaces, 
      refreshDevices
    }}>
      {children}
    </DeviceContext.Provider>
  );
}