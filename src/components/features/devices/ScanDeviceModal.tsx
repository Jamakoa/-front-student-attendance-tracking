import { useEffect, useState, useRef } from 'react';
import { X, Radar, Keyboard } from 'lucide-react';
import { useDevice } from '@/components/hooks/useDevice'; // Hook mis à jour
import { deviceService } from '@/services/deviceService'; // Toujours nécessaire pour le Ping/Manual
import { ScanTabContent } from './ScanTabContent';
import { ManualTabContent } from './ManualTabContent';

interface ScanDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const isValidIpFormat = (ip: string) => IP_REGEX.test(ip);

export function ScanDeviceModal({ isOpen, onClose }: ScanDeviceModalProps) {
    // 1. On récupère tout depuis le Provider (dont isScanning et scanNetwork)
    const { listsInterfaces, refreshDevices, refreshInterfaces, scanNetwork, isScanning } = useDevice();
    
    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

    // États UI pour le Scan (Configuration & Animation)
    const [selectedInterface, setSelectedInterface] = useState('');
    const [duration, setDuration] = useState(15); 
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<number | null>(null);

    // États Chargement Interfaces
    const [isLoadingInterfaces, setIsLoadingInterfaces] = useState(false);
    const [interfaceError, setInterfaceError] = useState(false);

    // États Manuel & Auth
    const [manualIp, setManualIp] = useState('');
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [manualError, setManualError] = useState('');
    const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

    // --- LOGIQUE ---
    
    // 1. Initialisation à l'ouverture
    useEffect(() => {
        if (isOpen) {
            setTimeLeft(0); setManualIp(''); setUsername('admin'); setPassword(''); setManualError(''); setIsAdding(false); setPingStatus('idle');
            const loadData = async () => {
                setIsLoadingInterfaces(true); 
                setInterfaceError(false);
                try { await refreshInterfaces(); } 
                catch { setInterfaceError(true); } 
                finally { setIsLoadingInterfaces(false); }
            };
            loadData();
        }
    }, [isOpen, refreshInterfaces]);

    // 2. Sélection automatique interface
    useEffect(() => {
        if (isOpen && !isLoadingInterfaces && !interfaceError && listsInterfaces.length > 0 && activeTab === 'scan') {
            const currentIsValid = listsInterfaces.some(i => String(i.index) === String(selectedInterface));
            if (!selectedInterface || !currentIsValid) setSelectedInterface(String(listsInterfaces[0].index));
        }
    }, [isOpen, listsInterfaces, selectedInterface, activeTab, isLoadingInterfaces, interfaceError]);

    // 3. Ping Automatique (Onglet Manuel)
    useEffect(() => {
        let isMounted = true; 
        if (activeTab !== 'manual' || !manualIp || !isValidIpFormat(manualIp)) { setPingStatus('idle'); return; }
        const timeoutId = setTimeout(async () => {
            if (!isMounted) return;
            setPingStatus('checking'); 
            try {
                const isReachable = await deviceService.ping(manualIp);
                if (isMounted) setPingStatus(isReachable ? 'success' : 'error');
            } catch { if (isMounted) setPingStatus('error'); }
        }, 800); 
        return () => { isMounted = false; clearTimeout(timeoutId); };
    }, [manualIp, activeTab]);

    // 4. Cleanup du Timer
    useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

    // --- HANDLERS ---

    const handleScan = async () => {
        if (!selectedInterface) return;

        // A. On lance l'animation UI (Timer local)
        setTimeLeft(duration); 
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => { 
                if (prev <= 1) { 
                    if (timerRef.current) clearInterval(timerRef.current); 
                    return 0; 
                } 
                return prev - 1; 
            });
        }, 1000);

        try {
            const interfaceObj = listsInterfaces.find(i => String(i.index) === String(selectedInterface));
            
            const scanConfig = {
                interfaceIndex: parseInt(selectedInterface, 10),
                interfaceName: interfaceObj ? interfaceObj.name : 'unknown',
                scanDuration: duration,
            };

            // B. APPEL PROVIDER : On lance le scan ET l'attente de l'animation en parallèle
            const animationPromise = new Promise(resolve => setTimeout(resolve, duration * 1000));
            const scanPromise = scanNetwork(scanConfig); // <-- Utilisation de la nouvelle fonction

            // On attend que les deux soient terminés pour fermer
            await Promise.all([scanPromise, animationPromise]);
            
            onClose();
        } catch (error) { 
            console.error(error); 
        } finally { 
            if (timerRef.current) clearInterval(timerRef.current); 
            // Pas besoin de reset isScanning, le Provider le gère
        }
    };

    const handleManualAdd = async () => {
        setManualError('');
        if (!isValidIpFormat(manualIp)) { setManualError("Format IP invalide"); return; }
        if (!username || !password) { setManualError("Login et Mot de passe requis"); return; }
        
        setIsAdding(true);
        try {
            await deviceService.addByIp(manualIp, username, password);
            await refreshDevices(); // On met à jour la liste globale
            onClose();
        } catch { 
            setManualError("Échec connexion : Vérifiez les identifiants."); 
        } finally { 
            setIsAdding(false); 
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isAdding && manualIp && pingStatus === 'success' && username && password) handleManualAdd();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100 scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-2 bg-white">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Ajouter un terminal</h2>
                        {!isScanning && !isAdding && (
                            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        )}
                    </div>
                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setActiveTab('scan')} disabled={isScanning || isAdding}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Radar className="w-4 h-4" /> Scan Réseau
                        </button>
                        <button onClick={() => setActiveTab('manual')} disabled={isScanning || isAdding}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Keyboard className="w-4 h-4" /> Saisie IP
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-4">
                    {activeTab === 'scan' ? (
                        <ScanTabContent 
                            isScanning={isScanning} // <-- Vient du Provider maintenant
                            timeLeft={timeLeft} 
                            duration={duration}
                            selectedInterface={selectedInterface} 
                            listsInterfaces={listsInterfaces}
                            isLoadingInterfaces={isLoadingInterfaces} 
                            interfaceError={interfaceError}
                            setDuration={setDuration} 
                            setSelectedInterface={setSelectedInterface} 
                            onStartScan={handleScan}
                        />
                    ) : (
                        <ManualTabContent 
                            manualIp={manualIp} setManualIp={setManualIp}
                            username={username} setUsername={setUsername}
                            password={password} setPassword={setPassword}
                            pingStatus={pingStatus} manualError={manualError} isAdding={isAdding}
                            onAdd={handleManualAdd} onKeyDown={handleKeyDown}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}