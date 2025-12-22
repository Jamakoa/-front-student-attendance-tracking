import { useEffect, useState } from 'react';
import { 
    X, Server, Cpu, Hash, Network, 
    Tag, Factory, Settings, Activity, type LucideIcon 
} from 'lucide-react';
import { deviceService } from '@/services/deviceService';
import type { DeviceInfo } from '@/components/model/dto/DeviceInfo';

interface InfoDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetIp: string | null;
}

export function InfoDeviceModal({ isOpen, onClose, targetIp }: InfoDeviceModalProps) {
    const [info, setInfo] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Chargement des données à l'ouverture ou changement d'IP
    useEffect(() => {
        // Si le modal est fermé ou pas d'IP, on ne fait rien
        if (!isOpen || !targetIp) return;

        let isMounted = true; // Flag pour éviter les mises à jour si le composant est démonté

        const fetchData = async () => {
            // On initialise l'état pour ce nouveau chargement
            setLoading(true);
            setError('');
            setInfo(null);

            try {
                const data = await deviceService.getDeviceInfo(targetIp, "admin", "Eni#2023");
                if (isMounted) {
                    setInfo(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Impossible de récupérer les informations de l'appareil.");
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup function : annule les mises à jour d'état si le composant est démonté/fermé pendant le fetch
        return () => {
            isMounted = false;
        };
    }, [isOpen, targetIp]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 scale-100 animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* En-tête */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Fiche Technique</h2>
                            <p className="text-xs text-slate-500 font-mono">{targetIp}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500">Récupération des données constructeur...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
                            <Activity className="w-5 h-5" />
                            {error}
                        </div>
                    ) : info ? (
                        <div className="space-y-6">
                            
                            {/* Bloc Principal */}
                            <div className="flex items-start justify-between bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-lg">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Device Name</p>
                                    <h3 className="text-xl font-bold">{info.deviceName}</h3>
                                    <div className="flex items-center gap-2 mt-3 bg-white/10 w-fit px-3 py-1 rounded-full text-xs">
                                        <Tag className="w-3 h-3" />
                                        {info.model}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Manufacturer</p>
                                    <div className="flex items-center justify-end gap-1 font-semibold">
                                        <Factory className="w-4 h-4" />
                                        {info.manufacturer}
                                    </div>
                                </div>
                            </div>

                            {/* Grille de Détails */}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={Hash} label="Serial Number" value={info.serialNumber} />
                                <InfoItem icon={Network} label="MAC Address" value={info.macAddress} copyable />
                                <InfoItem icon={Settings} label="Device Type" value={info.deviceType} />
                                <InfoItem icon={Cpu} label="Firmware" value={`${info.firmwareVersion}`} sub={`Build ${info.firmwareReleasedDate}`} />
                            </div>

                            {/* Section Technique */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>Encoder Version: <strong>{info.encoderVersion}</strong></span>
                                </div>
                                <span>{info.encoderReleasedDate}</span>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors text-sm">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

// Typage correct pour le composant helper
interface InfoItemProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    sub?: string;
    copyable?: boolean;
}

const InfoItem = ({ icon: Icon, label, value, sub, copyable }: InfoItemProps) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 hover:border-blue-100 transition-colors">
        <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
            <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 truncate ${copyable ? 'font-mono' : ''}`} title={String(value)}>
                {value}
            </p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);