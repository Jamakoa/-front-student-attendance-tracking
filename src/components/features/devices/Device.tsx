// src/components/features/devices/Device.tsx
import React, { useState } from 'react';
import { 
  Search, Plus, MoreHorizontal, 
  ScanFace, XCircle, LockKeyholeOpen, LockKeyhole,
  RefreshCw, MapPin, SearchX, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { ScanDeviceModal } from './ScanDeviceModal';
import { useDevice } from "@/components/hooks/useDevice";
import type { Device as DeviceType } from "@/components/model/Device"; 
import { ActionMenuDevice } from './ActionMenuDevices';
//import { deviceService } from '@/services/deviceService';
import { InfoDeviceModal } from './InfoDeviceModal';

export function Device() {

  const { devices } = useDevice();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const [selectedDeviceForInfo, setSelectedDeviceForInfo] = useState<string | null>(null);

  // --- ÉTATS PAGINATION 📄 ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Nombre d'éléments par page

  // --- ÉTATS ---
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [tempRoomValue, setTempRoomValue] = useState("");
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);

  // --- FILTRAGE ---
  const filteredDevices = devices.filter(device => {
    const query = searchQuery.toLowerCase();
    return (
      (device.name || '').toLowerCase().includes(query) ||
      (device.room || '').toLowerCase().includes(query) ||
      (device.ipv4 || '').includes(query)
    );
  });

  // --- LOGIQUE PAGINATION 🧮 ---
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevices = filteredDevices.slice(startIndex, endIndex);

  // --- HANDLERS PAGINATION ---
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // 👈 Important : On revient page 1 quand on cherche
  };

  // --- LOGIQUE ÉDITION SALLE ---
  const startEditing = (device: DeviceType) => {
    setEditingCode(device.codeDevice);
    setTempRoomValue(device.room || "");
  };

  const saveRoom = (theCodeDevice: string) => {
    console.log(`Nouvelle salle pour le code ${theCodeDevice} : ${tempRoomValue} (Local)`);
    setEditingCode(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, theCodeDevice: string) => {
    if (e.key === 'Enter') saveRoom(theCodeDevice);
    if (e.key === 'Escape') setEditingCode(null);
  };

  // --- HANDLERS ACTIONS ---
  const handleCloseMenu = () => setOpenMenuCode(null);

  const handleUploadUsers = async (device: DeviceType) => {
    handleCloseMenu();
    if(!confirm(`Confirmer l'envoi des utilisateurs vers ${device.name} ?`)) return;

    setIsLoadingAction(device.codeDevice);
    try {
        //await deviceService.uploadUsers(device.codeDevice);
        alert("✅ Synchronisation réussie !");
    } catch (error) {
        console.error(error);
        alert("❌ Erreur lors de l'envoi.");
    } finally {
        setIsLoadingAction(null);
    }
  };

  const handleDownloadLogs = async (device: DeviceType) => {
    handleCloseMenu();
    setIsLoadingAction(device.codeDevice);
    try {
        //await deviceService.downloadLogs(device.codeDevice);
        alert("✅ Logs importés !");
    } catch (error) {
        console.error(error);
        alert("❌ Erreur import logs.");
    } finally {
        setIsLoadingAction(null);
    }
  };

  const handleExplore = (device: DeviceType) => {
    handleCloseMenu();
    alert(`Fonctionnalité Explorer pour ${device.name} à venir !`);
  };

  const handleLogout = (device: DeviceType) => {
    handleCloseMenu();
    console.log("Déconnexion", device.name);
  };

  const handlePurge = (device: DeviceType) => {
    handleCloseMenu();
    if(confirm("ATTENTION: Effacer toutes les données ?")) {
        console.log("Purge", device.name);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 p-6 md:p-8" onClick={() => setOpenMenuCode(null)}>

      {/* Modale de Scan */}
      <ScanDeviceModal 
        isOpen={isScanModalOpen} 
        onClose={() => setIsScanModalOpen(false)} 
      />

      {/* --- NOUVEAU : Modale d'Infos --- */}
      <InfoDeviceModal 
        isOpen={!!selectedDeviceForInfo} 
        onClose={() => setSelectedDeviceForInfo(null)}
        targetIp={selectedDeviceForInfo}
      />
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Terminaux HIKVISION</h1>
          <p className="text-sm text-slate-500 mt-1">Surveillance et gestion du parc biométrique</p>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsScanModalOpen(true);
          }}
          className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="p-1 bg-white/20 rounded-md group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-sm">Scanner le réseau</span>
        </button>
      </div>

      {/* --- ZONE DE CONTENU --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible flex flex-col">
        
        {/* Barre de Recherche */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-sm rounded-t-2xl">
            <div className="relative w-full max-w-md group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Rechercher (IP, Salle, Nom)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  value={searchQuery}
                  onChange={handleSearchChange} // Utilisation du nouveau handler
                />
            </div>
            
            <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                {filteredDevices.length} terminaux trouvés
            </div>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-6 py-4 w-[280px]">Appareil (Nom)</th>
                <th className="px-6 py-4 w-[200px]">Salle</th>
                <th className="px-6 py-4">Réseau (IP / MAC)</th>
                <th className="px-6 py-4 text-center">Accès</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentDevices.length > 0 ? (
                currentDevices.map((device) => (
                  <tr 
                    key={device.mac} 
                    className="group hover:bg-slate-50/80 transition-colors duration-200"
                  >
                    
                    {/* 1. NOM DE L'APPAREIL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100/50 shadow-sm shrink-0">
                           {isLoadingAction === device.codeDevice ? (
                             <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                           ) : (
                             <ScanFace className="w-6 h-6 text-blue-600" />
                           )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate" title={device.name}>{device.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono border border-slate-200 truncate max-w-[120px]">
                                SN: {device.payload || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. SALLE */}
                    <td className="px-6 py-4">
                        {editingCode === device.codeDevice ? (
                            <div className="relative animate-in fade-in zoom-in-95 duration-200">
                                <input 
                                    autoFocus
                                    type="text"
                                    className="w-full px-3 py-1.5 text-sm border-2 border-blue-500 rounded-lg focus:outline-none shadow-sm bg-white text-slate-800"
                                    value={tempRoomValue}
                                    onChange={(e) => setTempRoomValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, device.codeDevice)}
                                    onBlur={() => saveRoom(device.codeDevice)}
                                />
                            </div>
                        ) : (
                            <div 
                                onDoubleClick={() => startEditing(device)}
                                className="group/edit inline-flex items-center gap-2 cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-white hover:shadow-sm hover:border hover:border-slate-200 border border-transparent transition-all"
                            >
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {device.room || <span className="text-slate-400 italic font-normal">Non assignée</span>}
                                </div>
                                <span className="opacity-0 group-hover/edit:opacity-100 text-[10px] text-blue-500 font-medium bg-blue-50 px-1.5 rounded transition-all">
                                    Éditer
                                </span>
                            </div>
                        )}
                    </td>

                    {/* 3. RÉSEAU */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-mono bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              {device.ipv4}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono pl-1">{device.mac}</span>
                      </div>
                    </td>

                    {/* 4. ACCÈS */}
                    <td className="px-6 py-4 text-center">
                      {device.isAuthenticated ? (
                        <div className="inline-flex flex-col items-center group/auth">
                          <div className="p-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-1">
                            <LockKeyholeOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-medium text-blue-600">Autorisé</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center group/auth">
                          <div className="p-2 rounded-full bg-slate-100 text-slate-400 border border-slate-200 mb-1">
                            <LockKeyhole className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">Verrouillé</span>
                        </div>
                      )}
                    </td>

                    {/* 5. STATUT */}
                    <td className="px-6 py-4 text-center">
                      {device.status === 'online' || device.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm ring-4 ring-emerald-500/5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          En ligne
                      </span>
                      ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                          <XCircle className="w-3.5 h-3.5" />
                          Hors ligne
                      </span>
                      )}
                    </td>

                    {/* 6. ACTIONS */}
                    <td className="px-6 py-4 text-right relative">
                      <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuCode(openMenuCode === device.codeDevice ? null : device.codeDevice);
                          }}
                          disabled={isLoadingAction === device.codeDevice}
                          className={`p-2 rounded-lg transition-all duration-200 ${openMenuCode === device.codeDevice ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                      >
                         {isLoadingAction === device.codeDevice ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
                      </button>

                      {openMenuCode === device.codeDevice && (
                          <ActionMenuDevice
                            device={device}
                            onClose={handleCloseMenu}
                            onUpload={() => handleUploadUsers(device)}
                            onDownload={() => handleDownloadLogs(device)}
                            onExplore={() => handleExplore(device)}
                            onLogout={() => handleLogout(device)}
                            onPurge={() => handlePurge(device)}
                            onInfo={() => { 
                                handleCloseMenu();
                                setSelectedDeviceForInfo(device.ipv4); 
                            }}
                          />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                /* EMPTY STATE */
                <tr>
                    <td colSpan={6} className="py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <SearchX className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium text-lg">Aucun terminal trouvé</h3>
                            <p className="text-slate-500 max-w-sm mt-1 mb-6 text-sm">
                                {searchQuery 
                                    ? `Aucun résultat pour "${searchQuery}".` 
                                    : "Votre liste est vide. Lancez un scan réseau."
                                }
                            </p>
                            {!searchQuery && (
                                <button onClick={() => setIsScanModalOpen(true)} className="text-blue-600 font-medium text-sm hover:underline hover:text-blue-700 flex items-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5" /> Lancer un scan
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* --- FOOTER PAGINATION --- */}
        {filteredDevices.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Info texte */}
                <div className="text-xs text-slate-500 font-medium">
                    Affichage de <span className="text-slate-900">{filteredDevices.length === 0 ? 0 : startIndex + 1}</span> à <span className="text-slate-900">{Math.min(endIndex, filteredDevices.length)}</span> sur <span className="text-slate-900">{filteredDevices.length}</span> résultats
                </div>

                {/* Contrôles de pagination */}
                <div className="flex items-center gap-1">
                    {/* Bouton Début */}
                    <button 
                        onClick={() => goToPage(1)} 
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Première page"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    {/* Bouton Précédent */}
                    <button 
                        onClick={() => goToPage(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Page précédente"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Numéros de page */}
                    <div className="flex items-center gap-1 px-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logique simple pour afficher quelques pages (à améliorer si > 100 pages)
                            let p = i + 1;
                            if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                            if (p > totalPages) return null;
                            if (p < 1) return null;

                            return (
                                <button
                                    key={p}
                                    onClick={() => goToPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                        currentPage === p 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bouton Suivant */}
                    <button 
                        onClick={() => goToPage(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Page suivante"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* Bouton Fin */}
                    <button 
                        onClick={() => goToPage(totalPages)} 
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Dernière page"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}