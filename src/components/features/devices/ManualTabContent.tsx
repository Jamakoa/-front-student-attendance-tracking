import { 
    MonitorSmartphone, CheckCircle2, Wifi, WifiOff, Loader2, User, Lock 
} from 'lucide-react';

interface ManualTabContentProps {
    manualIp: string;
    setManualIp: (val: string) => void;
    pingStatus: 'idle' | 'checking' | 'success' | 'error';
    manualError: string;
    
    username: string;
    setUsername: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    
    isAdding: boolean;
    onAdd: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ManualTabContent({
    manualIp, setManualIp, pingStatus, manualError,
    username, setUsername, password, setPassword,
    isAdding, onAdd, onKeyDown
}: ManualTabContentProps) {

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            
            {/* Message d'aide dynamique */}
            <div className={`p-4 rounded-xl border text-sm transition-colors duration-300 ${
                pingStatus === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
                {pingStatus === 'success' 
                    ? <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Appareil détecté ! Veuillez vous authentifier.</p>
                    : <p>Saisissez l'adresse IP. Si l'appareil répond, le formulaire de connexion apparaîtra.</p>
                }
            </div>

            <div className="space-y-4">
                {/* CHAMP IP */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <MonitorSmartphone className="w-4 h-4 text-slate-400" /> Adresse IP
                    </label>
                    <div className="relative">
                        <input 
                            type="text" placeholder="Ex: 192.168.1.201" 
                            value={manualIp} onChange={(e) => setManualIp(e.target.value)} 
                            className={`w-full pl-4 pr-12 py-3 bg-white border rounded-xl outline-none text-sm focus:ring-2 transition-all font-mono ${pingStatus === 'error' ? 'border-red-300 focus:ring-red-100' : pingStatus === 'success' ? 'border-emerald-300 focus:ring-emerald-100' : 'border-slate-200 focus:ring-blue-500'}`} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            {pingStatus === 'checking' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                            {pingStatus === 'success' && <div className="animate-in zoom-in"><Wifi className="w-5 h-5 text-emerald-500" /></div>}
                            {pingStatus === 'error' && <div className="animate-in zoom-in"><WifiOff className="w-5 h-5 text-red-500" /></div>}
                            {pingStatus === 'idle' && <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                    </div>
                    {pingStatus === 'error' && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">Terminal injoignable.</p>}
                </div>

                {/* FORMULAIRE AUTHENTIFICATION (Apparaît seulement si Ping OK) */}
                {pingStatus === 'success' && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" /> Identifiant
                            </label>
                            <input 
                                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="admin"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400" /> Mot de passe
                            </label>
                            <input 
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                )}

                {manualError && <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1 bg-red-50 p-2 rounded-lg border border-red-100">{manualError}</p>}
            </div>

            <button 
                onClick={onAdd}
                disabled={isAdding || !manualIp || pingStatus !== 'success' || !password} 
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isAdding ? "Authentification..." : "Ajouter & Connecter"}
            </button>
        </div>
    );
}