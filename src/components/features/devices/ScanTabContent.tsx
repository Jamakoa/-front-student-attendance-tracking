// src/components/features/devices/tabs/ScanTabContent.tsx
import { Network, Timer, Radar, Loader2, WifiOff, AlertTriangle, XCircle } from 'lucide-react';
import type { NetworkInterface } from '@/components/model/dto/NetworkInterface';

interface ScanTabContentProps {
    isScanning: boolean;
    timeLeft: number;
    duration: number;
    selectedInterface: string;
    listsInterfaces: NetworkInterface[];
    isLoadingInterfaces: boolean;
    interfaceError: boolean;

    setDuration: (val: number) => void;
    setSelectedInterface: (val: string) => void;
    onStartScan: () => void;
    onCancelScan: () => void;
}

export function ScanTabContent({
    isScanning, timeLeft, duration, selectedInterface, 
    listsInterfaces, isLoadingInterfaces, interfaceError,
    setDuration, setSelectedInterface, onStartScan, onCancelScan
}: ScanTabContentProps) {


    if (isScanning) {
        return (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-lg border border-blue-100 flex items-center justify-center w-24 h-24">
                        <span className="text-2xl font-bold text-blue-600 font-mono">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center w-full">
                    <p className="text-slate-900 font-medium mb-2">Recherche en cours...</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000 ease-linear" style={{ width: `${((duration - timeLeft) / duration) * 100}%` }} />
                    </div>
                    {/* --- 3. LE BOUTON ANNULER --- */}
                    <button 
                        onClick={onCancelScan}
                        className="mt-6 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-full transition-all flex items-center gap-2 mx-auto"
                    >
                        <XCircle className="w-4 h-4" />
                        Annuler la recherche
                    </button>
                    {/* --------------------------- */}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Network className="w-4 h-4 text-slate-400" /> Interface Réseau
                </label>
                
                {isLoadingInterfaces ? (
                    <div className="text-sm text-blue-600 bg-blue-50 p-4 rounded-xl flex gap-3 items-center justify-center border border-blue-100 animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" /> <span>Recherche des interfaces...</span>
                    </div>
                ) : interfaceError ? (
                    <div className="text-sm text-rose-600 bg-rose-50 p-4 rounded-xl flex gap-3 items-center border border-rose-100">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div><p className="font-semibold">Serveur inaccessible</p></div>
                    </div>
                ) : listsInterfaces.length > 0 ? (
                    <select value={selectedInterface} onChange={(e) => setSelectedInterface(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500">
                        {listsInterfaces.map((iface) => (<option key={iface.index} value={iface.index}>{iface.name}: {iface.ipv4}</option>))}
                    </select>
                ) : (
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg flex gap-2 items-center"><WifiOff className="w-4 h-4" /> Aucune interface réseau détectée.</div>
                )}
            </div>

            <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Timer className="w-4 h-4 text-slate-400" /> Durée</label>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{duration} sec</span>
                </div>
                <input type="range" min="5" max="60" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    
            </div>
            <button onClick={onStartScan} disabled={!selectedInterface || isLoadingInterfaces || interfaceError} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Radar className="w-4 h-4" /> Lancer le scan
            </button>
        </>
    );
}