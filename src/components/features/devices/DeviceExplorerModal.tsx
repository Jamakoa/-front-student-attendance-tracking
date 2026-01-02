import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  X, Activity, HardDrive, RefreshCw, Clock,
  Users, CreditCard, ScanFace, Fingerprint, SlidersHorizontal,
  ChevronLeft, ChevronRight, CheckCircle2, ListFilter, Search,
  User, ShieldAlert, KeyRound,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { deviceService } from '@/services/deviceService';
import type { DeviceInfo } from '@/components/model/dto/DeviceInfo';
import type { DeviceUser } from '@/components/model/dto/DeviceUser';
import type { DeviceLog } from '@/components/model/dto/DeviceLog';

interface DeviceExplorerModalProps {
    isOpen: boolean;
    onClose: () => void;
    ip: string | null;
    deviceName: string;
}

// Filtres pour l'envoi au backend (On garde la structure pour la requête)
const FILTER_OPTIONS = {
    MAJOR: [
        { value: 5, label: "Contrôle d'Accès" },
        { value: 1, label: "Alarme" },
        { value: 2, label: "Exception" },
        { value: 0, label: "Tous les types" }
    ],
    MINOR: [
        { value: -1, label: "Tout afficher", group: "Général" },
        { value: 75, label: "Visage Validé", group: "Succès" },
        { value: 38, label: "Empreinte Validée", group: "Succès" },
        { value: 1,  label: "Carte Validée", group: "Succès" },
        { value: 76, label: "Échec Visage", group: "Échec" },
        { value: 39, label: "Échec Empreinte", group: "Échec" },
        { value: 33, label: "Utilisateur Inconnu", group: "Échec" }
    ]
};

type TabType = 'overview' | 'users' | 'logs';

export function DeviceExplorerModal({ isOpen, onClose, ip, deviceName }: DeviceExplorerModalProps) {
    
    // Gestion des états
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [info, setInfo] = useState<DeviceInfo | null>(null);
    
    // États USERS
    const [users, setUsers] = useState<DeviceUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 30;
    
    // Stocke les IDs (employeeNo) des utilisateurs cochés
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // État de chargement pour l'importation (évite le double-clic)
    const [isImporting, setIsImporting] = useState(false);

    //Filtres locaux (pour la barre d'outils)
    const [userSearch, setUserSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
    const [bioFilter, setBioFilter] = useState<'all' | 'face' | 'finger' | 'card'>('all');

    // États LOGS
    const [logs, setLogs] = useState<DeviceLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // États FILTRES LOGS
    const today = new Date().toISOString().split('T')[0];
    const [logFilters, setLogFilters] = useState({
        startTime: `${today}T00:00:00`,
        endTime: `${today}T23:59:59`,
        majorType: 5,
        minorType: -1,
        searchQuery: '', 
    });

    const [showFilters, setShowFilters] = useState(false);

    // --- FONCTIONS ---

    const loadInfo = useCallback(async () => {
        if (!ip) return;
        try {
            const data = await deviceService.getDeviceInfo(ip);
            setInfo(data);
        } catch (error) { console.error(error); }
    }, [ip]);

    // Chargement des utilisateurs
    const loadUsers = useCallback(async () => {
        if (!ip) return;
        setIsLoadingUsers(true);
        try {
            const offset = (page - 1) * limit;
            const data = await deviceService.getDeviceUsers(ip, offset, limit);
            setUsers(data || []);
            // Quand on change de page, on vide la sélection pour éviter les erreurs
            setSelectedUsers([]); 
        } catch { toast.error("Erreur chargement utilisateurs"); } 
        finally { setIsLoadingUsers(false); }
    }, [ip, page]);

    // Chargement des logs avec filtres
    const loadLogs = useCallback(async () => {
        if (!ip) return;
        setIsLoadingLogs(true);
        try {
            const data = await deviceService.getDeviceLogs(
                ip, logFilters.endTime, logFilters.startTime, 
                logFilters.majorType, logFilters.minorType, 
                logFilters.searchQuery
            );
            setLogs(data || []);
            if(data && data.length === 0) toast.info("Aucun résultat trouvé.");
        } catch (e) { 
            console.error(e);
            toast.error("Erreur recherche logs");
        } 
        finally { setIsLoadingLogs(false); }
    }, [ip, logFilters]);

    // On filtre la liste 'users' (les 30 reçus) selon ce que l'utilisateur tape ou sélectionne
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            // Recherche par nom ou ID
            const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.employeeNo.includes(userSearch);
            // Filtre Genre
            const matchesGender = genderFilter === 'all' || u.gender === genderFilter;
            // Filtre Biométrie (Est-ce qu'il a un Visage ? Une Empreinte ?)
            const matchesBio = bioFilter === 'all' 
                || (bioFilter === 'face' && u.numOfFace > 0)
                || (bioFilter === 'finger' && u.numOfFP > 0)
                || (bioFilter === 'card' && u.numOfCard > 0);
            
            return matchesSearch && matchesGender && matchesBio;
        });
    }, [users, userSearch, genderFilter, bioFilter]);

    const handleSelectAll = () => {
        // Si tout est déjà sélectionné, on vide. Sinon, on remplit tout.
        if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedUsers([]); 
        } else {
            setSelectedUsers(filteredUsers.map(u => u.employeeNo)); 
        }
    };

    const handleSelectOne = (id: string) => {
        // Ajoute ou retire l'ID de la liste
        if (selectedUsers.includes(id)) {
            setSelectedUsers(prev => prev.filter(uid => uid !== id));
        } else {
            setSelectedUsers(prev => [...prev, id]);
        }
    };

     // 3. Importation (Action Principale)
    const handleImportSelected = async () => {
        if (!ip || selectedUsers.length === 0) return;
        setIsImporting(true);
        try {
            // Appel au service pour sauvegarder dans la BDD
            await deviceService.importUsersFromDevice(ip, selectedUsers);
            toast.success(`${selectedUsers.length} utilisateurs importés avec succès !`);
            setSelectedUsers([]); // On vide la sélection après succès
        } catch {
            toast.error("Erreur lors de l'importation");
        } finally {
            setIsImporting(false);
        }
    };

    // 4. Importation "Tout sauf Admin" (Action Rapide)
    const handleImportAllExceptAdmin = async () => {
        if (!ip || !confirm("Voulez-vous importer tous les utilisateurs visibles (sauf Admin) ?")) return;
        
        // On filtre localement l'admin (ID '1' ou nom 'admin')
        const allIds = users
            .filter(u => u.employeeNo !== '1' && u.name.toLowerCase() !== 'admin')
            .map(u => u.employeeNo);
            
        setIsImporting(true);
        try {
            await deviceService.importUsersFromDevice(ip, allIds);
            toast.success("Importation terminée !");
        } catch { toast.error("Erreur import global"); } 
        finally { setIsImporting(false); }
    };

    // Reset complet quand la modale s'ouvre
    useEffect(() => {
        if (isOpen) {
            setPage(1); setUsers([]); setLogs([]); setShowFilters(false); setSelectedUsers([]);
        }
    }, [isOpen]); 

    // Chargement intelligent selon l'onglet actif
    useEffect(() => {
        if (!isOpen || !ip) return;
        if (activeTab === 'overview') loadInfo();
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'logs' && logs.length === 0) loadLogs();
    }, [isOpen, ip, activeTab, loadInfo, loadUsers, loadLogs, logs.length]);


    if (!isOpen || !ip) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* HEADER */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {deviceName}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-mono mt-0.5 text-slate-500">
                           <Activity className="w-3 h-3" /> {ip}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-slate-100 px-6 shrink-0 bg-white">
                    <TabButton id="overview" label="Système" icon={<Activity className="w-4 h-4"/>} active={activeTab} onClick={setActiveTab} />
                    <TabButton id="users" label="Utilisateurs" icon={<Users className="w-4 h-4"/>} active={activeTab} onClick={setActiveTab} />
                    <TabButton id="logs" label="Historique" icon={<HardDrive className="w-4 h-4"/>} active={activeTab} onClick={setActiveTab} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6">
                    
                    {/* --- TAB: USERS --- */}
                    {activeTab === 'users' && (
                        <div className="flex flex-col h-full gap-4">

                            {/* --- BARRE D'OUTILS INTELLIGENTE --- */}
                            {/* Change de couleur si des items sont sélectionnés */}
                            <div className={`p-3 rounded-xl border shadow-sm transition-all duration-300 flex flex-col md:flex-row gap-3 items-center justify-between ${
                                selectedUsers.length > 0 ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200'
                            }`}>
                                
                                {/* ÉTAT 1 : PAS DE SÉLECTION -> AFFICHER RECHERCHE & FILTRES */}
                                {selectedUsers.length === 0 ? (
                                    <div className="flex flex-1 gap-3 w-full md:w-auto">
                                        {/* Recherche Texte */}
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Rechercher nom ou ID..." 
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all"
                                                value={userSearch}
                                                onChange={e => setUserSearch(e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Dropdown : Genre */}
                                        <select 
                                            className="px-3 py-2 text-sm bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 border-transparent cursor-pointer text-slate-600"
                                            value={genderFilter}
                                            onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
                                        >
                                            <option value="all">Tous genres</option>
                                            <option value="male">Hommes</option>
                                            <option value="female">Femmes</option>
                                        </select>

                                        {/* Dropdown : Biométrie */}
                                        <select 
                                            className="px-3 py-2 text-sm bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 border-transparent cursor-pointer text-slate-600 hidden md:block"
                                            value={bioFilter}
                                            onChange={(e) => setBioFilter(e.target.value as 'all' | 'face' | 'finger' | 'card')}
                                        >
                                            <option value="all">Toute biométrie</option>
                                            <option value="face">Visage (FaceID)</option>
                                            <option value="finger">Empreinte</option>
                                            <option value="card">Carte</option>
                                        </select>
                                    </div>
                                ) : (
                                    /* ÉTAT 2 : SÉLECTION ACTIVE -> AFFICHER COMPTEUR */
                                    <div className="flex items-center gap-2 text-blue-700 font-medium px-2">
                                        <div className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center text-xs font-bold">
                                            {selectedUsers.length}
                                        </div>
                                        <span>utilisateurs sélectionnés</span>
                                        {/* Bouton Annuler */}
                                        <button onClick={() => setSelectedUsers([])} className="ml-2 text-xs text-slate-400 hover:text-slate-600 underline">Annuler</button>
                                    </div>
                                )}

                                {/* BOUTONS D'ACTION (DROITE) */}
                                <div className="flex gap-2">
                                    {selectedUsers.length > 0 ? (
                                        // Bouton "IMPORTER LA SÉLECTION" (Apparaît quand sélection > 0)
                                        <button 
                                            onClick={handleImportSelected}
                                            disabled={isImporting}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                                        >
                                            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                                            Importer la sélection
                                        </button>
                                    ) : (
                                        // Boutons par défaut
                                        <>
                                            <button 
                                                onClick={handleImportAllExceptAdmin}
                                                disabled={isImporting}
                                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                title="Importe tout sauf l'utilisateur ID 1 ou Admin"
                                            >
                                                <Download className="w-4 h-4" />
                                                Tout Importer
                                            </button>
                                            <button 
                                                onClick={() => loadUsers()}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Rafraîchir la liste"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* --- TABLEAU UTILISATEURS --- */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 relative flex flex-col">
                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                                            <tr>
                                                {/* CHECKBOX GLOBAL (Tout sélectionner sur la page) */}
                                                <th className="px-4 py-3 w-10 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th className="px-4 py-3 font-semibold w-24">ID</th>
                                                <th className="px-4 py-3 font-semibold">Nom</th>
                                                <th className="px-4 py-3 font-semibold text-center">Genre</th>
                                                <th className="px-4 py-3 font-semibold text-center">Biométrie</th>
                                                <th className="px-4 py-3 font-semibold text-center">Statut</th>
                                                <th className="px-4 py-3 font-semibold text-right">Expiration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredUsers.length > 0 ? filteredUsers.map((u) => {
                                                // Vérifie si cet utilisateur est coché
                                                const isSelected = selectedUsers.includes(u.employeeNo);
                                                return (
                                                    <tr 
                                                        key={u.employeeNo} 
                                                        // Change la couleur de fond si sélectionné
                                                        className={`transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}`}
                                                        // Clique n'importe où sur la ligne pour cocher
                                                        onClick={() => handleSelectOne(u.employeeNo)}
                                                    >
                                                        {/* CHECKBOX INDIVIDUEL */}
                                                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                                                checked={isSelected}
                                                                onChange={() => handleSelectOne(u.employeeNo)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-slate-600 text-xs">{u.employeeNo}</td>
                                                        <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {u.gender === 'male' && (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold" title="Homme">
                                                                    H
                                                                </span>
                                                            )}
                                                            {u.gender === 'female' && (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold" title="Femme">
                                                                    F
                                                                </span>
                                                            )}
                                                            {(u.gender === 'unknown' || !u.gender) && (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-400 text-xs font-bold" title="Inconnu">
                                                                    ?
                                                                </span>
                                                            )}
                                                        </td>
                                                        {/* Icones Biométrie colorées si présentes */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-3 text-slate-300">
                                                                <div title="Carte" className="flex items-center">
                                                                    <CreditCard className={`w-4 h-4 ${u.numOfCard > 0 ? 'text-purple-600' : ''}`} />
                                                                </div>
                                                                <div title="Empreinte" className="flex items-center">
                                                                    <Fingerprint className={`w-4 h-4 ${u.numOfFP > 0 ? 'text-blue-600' : ''}`} />
                                                                </div>
                                                                <div title="Visage" className="flex items-center">
                                                                    <ScanFace className={`w-4 h-4 ${u.numOfFace > 0 ? 'text-indigo-600' : ''}`} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {u.enable 
                                                                ? <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500" title="Actif"></span> 
                                                                : <span className="inline-flex w-2 h-2 rounded-full bg-slate-300" title="Inactif"></span>
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-500 text-xs font-mono">
                                                            {new Date(u.endTime).getFullYear()}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                                        {isLoadingUsers ? <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500"/> : "Aucun utilisateur trouvé."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Simple */}
                                <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                                    <span className="text-xs font-medium text-slate-500">Page {page}</span>
                                    <button onClick={() => setPage(p => p + 1)} disabled={users.length < limit} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: LOGS --- */}
                    {activeTab === 'logs' && (
                    <div className="flex flex-col h-full gap-4">
                        
                        {/* 1. BARRE D'OUTILS */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Rechercher par Nom ou Matricule..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400"
                                    value={logFilters.searchQuery}
                                    onChange={e => setLogFilters({...logFilters, searchQuery: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && loadLogs()}
                                />
                            </div>
                            <div className="hidden md:block w-px bg-slate-200 my-1"></div>
                            <div className="flex gap-2 px-1">
                                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                                    <SlidersHorizontal className="w-4 h-4" /> Filtres
                                </button>
                                <button onClick={loadLogs} disabled={isLoadingLogs} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                                    {isLoadingLogs ? <RefreshCw className="w-4 h-4 animate-spin"/> : "Actualiser"}
                                </button>
                            </div>
                        </div>

                        {/* 2. FILTRES AVANCÉS */}
                        {showFilters && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase flex gap-1"><Clock className="w-3 h-3"/> Début</label>
                                            <input type="datetime-local" className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                                value={logFilters.startTime} onChange={e => setLogFilters({...logFilters, startTime: e.target.value})} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase flex gap-1"><Clock className="w-3 h-3"/> Fin</label>
                                            <input type="datetime-local" className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                                value={logFilters.endTime} onChange={e => setLogFilters({...logFilters, endTime: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Type Principal</label>
                                        <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={logFilters.majorType} onChange={e => setLogFilters({...logFilters, majorType: parseInt(e.target.value)})}>
                                            {FILTER_OPTIONS.MAJOR.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Détail</label>
                                        <select className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50"
                                            value={logFilters.minorType} onChange={e => setLogFilters({...logFilters, minorType: parseInt(e.target.value)})}
                                            disabled={logFilters.majorType !== 5 && logFilters.majorType !== 0}>
                                            <optgroup label="Général"><option value={-1}>Tout afficher</option></optgroup>
                                            <optgroup label="✅ Succès">{FILTER_OPTIONS.MINOR.filter(o => o.group === 'Succès').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                                            <optgroup label="❌ Échecs">{FILTER_OPTIONS.MINOR.filter(o => o.group === 'Échec').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. TABLEAU DES LOGS */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 relative flex flex-col">
                            <div className="overflow-auto flex-1">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold w-40">Date & Heure</th>
                                            <th className="px-6 py-3 font-semibold w-[200px]">Utilisateur</th>
                                            <th className="px-6 py-3 font-semibold">Mode</th>
                                            <th className="px-6 py-3 font-semibold">Description</th>
                                            <th className="px-6 py-3 font-semibold text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.length > 0 ? logs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                                {/* DATE */}
                                                <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                                                    {log.time.replace('T', ' ')}
                                                </td>
                                                
                                                {/* UTILISATEUR */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                            {log.pictureUrl ? <img src={log.pictureUrl} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-700 text-sm">{log.name || 'Inconnu'}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">ID: {log.employeeNo || '?'}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* MODE (ICONES) */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2 text-slate-500" title={log.verificationMode}>
                                                        {/* Logique simple pour afficher l'icone */}
                                                        {log.verificationMode?.toLowerCase().includes('face') ? <ScanFace className="w-4 h-4 text-indigo-500" /> :
                                                         log.verificationMode?.toLowerCase().includes('finger') ? <Fingerprint className="w-4 h-4 text-blue-500" /> :
                                                         log.verificationMode?.toLowerCase().includes('card') ? <CreditCard className="w-4 h-4 text-purple-500" /> :
                                                         log.verificationMode?.toLowerCase().includes('password') ? <KeyRound className="w-4 h-4 text-orange-500" /> :
                                                         <span className="text-xs uppercase bg-slate-100 px-1.5 py-0.5 rounded">{log.verificationMode}</span>}
                                                    </div>
                                                </td>

                                                {/* DESCRIPTION */}
                                                <td className="px-6 py-3">
                                                    <span className="text-sm text-slate-600">{log.description}</span>
                                                </td>

                                                {/* STATUT (BADGE) */}
                                                <td className="px-6 py-3 text-right">
                                                    {!log.error ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-medium">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Succès
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-medium">
                                                            <ShieldAlert className="w-3.5 h-3.5" /> Échec
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            /* --- EMPTY STATE CENTRÉ --- */
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                                        {isLoadingLogs ? (
                                                            <>
                                                                <RefreshCw className="w-8 h-8 animate-spin text-blue-500"/>
                                                                <span className="text-sm">Chargement des logs en cours...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                                    <ListFilter className="w-8 h-8 text-slate-300" />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-slate-900 font-medium">Aucun historique trouvé</p>
                                                                    <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos filtres ou la période.</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 text-right uppercase tracking-wider font-semibold">
                                {logs.length} Événements affichés
                            </div>
                        </div>
                    </div>
                    )}

                    {/* --- TAB: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="text-center text-slate-400 py-10">
                            {info ? <div>Info système chargée : {info.deviceName}</div> : <div>Chargement du système...</div>}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

interface TabButtonProps {
    id: TabType;
    label: string;
    icon: React.ReactNode; 
    active: TabType;
    onClick: (id: TabType) => void;
}

function TabButton({ id, label, icon, active, onClick }: TabButtonProps) {
    return (
        <button onClick={() => onClick(id)} className={`px-6 py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${active === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            {icon} {label}
        </button>
    )
}