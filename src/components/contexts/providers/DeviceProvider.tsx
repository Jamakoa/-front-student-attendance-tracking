import type { ReactNode } from "react";
import { DeviceContext } from "../DeviceContext";
import { useState, useCallback, useEffect } from "react";
import type { Device } from "@/components/model/Device";
import { deviceService } from "@/services/deviceService";
import type { ScanConfig } from "@/components/model/dto/ScanConfig";
import type { FrontEndSession } from "@/components/model/dto/FrontEndSession";
import type { NetworkInterface } from "@/components/model/dto/NetworkInterface";
import { toast } from "sonner";

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

          setSessions(prev => {
            const updatedSessions = { ...prev };
            
            response.forEach(device => {
                // Si le backend dit que c'est ouvert (unlocked: true)
                // On crée la session locale immédiatement
                if (device.unlocked === true) {
                    updatedSessions[device.ipv4] = {
                        ip: device.ipv4,
                        username: 'admin', // Valeur par défaut
                        isAuthenticated: true
                    };
                } else {
                    // Si le backend dit que c'est fermé, on nettoie
                    delete updatedSessions[device.ipv4];
                }
            });
            
            return updatedSessions;
        });

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
      const newDevicesFound = await deviceService.scan(config);

      if(Array.isArray(newDevicesFound) && newDevicesFound.length > 0) {

        setDevices((currentDevices) => {
          const existingMacs = new Set(currentDevices.map(d => d.mac));
          const trulyNewDevices = newDevicesFound.filter(d => !existingMacs.has(d.mac));
          console.log(`Ajout de ${trulyNewDevices.length} appareils à la liste.`);
          return [...currentDevices, ...trulyNewDevices];
        });

        toast.success("Nouveaux appareils trouvés", {
            description: `${newDevicesFound.length} appareil(s) ajouté(s) à la liste.`
        });
      } else {
          toast.info("Aucun nouvel appareil trouvé", {
              description: "Aucun appareil supplémentaire n'a été détecté sur le réseau."
          });
      }
      
      return true;
    } catch (error) {
      console.error("Erreur durant le scan", error);
      return false;
    } finally {
      setIsScanning(false);
    }
  }, []);

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
        toast.success("Terminal déverrouillé");
        return true;
    } catch (error) {
        console.error("Erreur authentification:", error);
        const err = error as Error;
        toast.error("Échec d'authentification", {
            description: err.message 
        });
        
        throw error;
    }
  }, []);

  // Lock device function
  const lockDevice = useCallback(async (ip: string) => {
    try {
        const success =  await deviceService.lock(ip);
        // On retire la session locale
        if (success) {
            setSessions(prev => {
                const newSessions = { ...prev };
                delete newSessions[ip];
                return newSessions;
            });
            // Optionnel : toast.success("Verrouillé");
            return true;
        } else {
            // Si le backend dit "success: false" (mais sans erreur HTTP)
            console.warn("Le backend a refusé le verrouillage");
            return false;
        }
    } catch (error) {
        console.error("Erreur lors du verrouillage", error);
        return false;
    }
  }, []);

  // 3. Helper for l'UI
  const isDeviceUnlocked = useCallback( (ip: string) => {
    return !!sessions[ip]?.isAuthenticated;
  }, [sessions]);

  const cancelScan = useCallback(async () => {
    try {
        // 1. On arrête visuellement le scan tout de suite pour la réactivité UI
        setIsScanning(false);

        // 2. On envoie l'ordre au backend
        await deviceService.cancelScan();
        
        toast.info("Recherche arrêtée", {
            description: "Le scan réseau a été interrompu."
        });

    } catch (error) {
        console.error("Erreur annulation scan", error);
        // Même si l'appel échoue, on assure que l'UI est débloquée
        setIsScanning(false); 
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
      isScanning,
      sessions,         
      unlockDevice,     
      lockDevice,       
      isDeviceUnlocked,
      scanNetwork,    
      refreshInterfaces, 
      refreshDevices,
      cancelScan
    }}>
      {children}
    </DeviceContext.Provider>
  );
}