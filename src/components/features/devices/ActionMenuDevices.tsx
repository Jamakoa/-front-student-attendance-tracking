import { useEffect, useRef } from 'react';
import { 
  DownloadCloud, UploadCloud, FolderOpen, 
  LogOut, DatabaseZap, Info
} from 'lucide-react';
import type { Device } from "@/components/model/Device";

interface ActionMenuDeviceProps {
  device: Device;
  onClose: () => void;
  onInfo: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onExplore: () => void;
  onLogout: () => void;
  onPurge: () => void;
}

export function ActionMenuDevice({ 
  device, onClose, onInfo, onUpload,
  onDownload, onExplore, onLogout, onPurge 
}: ActionMenuDeviceProps) {
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Gestion du clic en dehors pour fermer le menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
        ref={menuRef}
        className="absolute right-8 top-6 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()} // Empêche le clic dans le menu de fermer le menu
    >
        {/* En-tête */}
        <div className="px-4 py-2.5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Données & Sync</span>
            <span className="text-[10px] text-slate-400 font-mono">{device.ipv4}</span>
        </div>

        {/* SECTION 1 : FLUX VERS APPAREIL (Upload) */}
        <div className="p-1.5 space-y-0.5 bg-blue-50/30">
            <button 
                onClick={onUpload}
                className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Envoyer Utilisateurs
            </button>
        </div>

        <div className="h-px bg-slate-100 my-0.5 mx-2"></div>

        {/* SECTION 2 : FLUX DEPUIS APPAREIL (Download/View) */}
        <div className="p-1.5 space-y-0.5">
            <button 
                onClick={onInfo}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <Info className="w-4 h-4 text-slate-400" />
                Détails & Infos
            </button>
            <button 
                onClick={onDownload}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <DownloadCloud className="w-4 h-4 text-slate-400" />
                Importer les logs
            </button>
            <button 
                onClick={onExplore}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <FolderOpen className="w-4 h-4 text-slate-400" />
                Explorer contenu
            </button>
        </div>

        <div className="h-px bg-slate-100 my-0.5 mx-2"></div>

        {/* SECTION 3 : ADMIN */}
        <div className="p-1.5">
            <button 
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <LogOut className="w-4 h-4 text-slate-400" />
                Fermer session
            </button>
            <button 
                onClick={onPurge}
                className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg flex items-center gap-3 transition-colors font-medium"
            >
                <DatabaseZap className="w-4 h-4 opacity-70" />
                Purger mémoire
            </button>
        </div>
    </div>
  );
}