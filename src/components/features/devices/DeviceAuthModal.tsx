import React, { useState } from 'react';
import { Lock, Unlock, Loader2, X, ShieldCheck } from 'lucide-react';

interface DeviceAuthModalProps {
    isOpen: boolean;
    targetDevice: { ip: string, name: string } | null;
    onClose: () => void;
    onSuccess: (user: string, pass: string) => Promise<void>;
}

export function DeviceAuthModal({ isOpen, onClose, targetDevice, onSuccess }: DeviceAuthModalProps) {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !targetDevice) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // On tente l'action passée par le parent (unlockDevice)
            await onSuccess(username, password);
            
            // Si pas d'erreur, on ferme
            onClose();
            setPassword(''); 
        } catch (err) {
            console.error(err);
            setError("Échec de l'authentification. Vérifiez les identifiants.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" /> 
                        Authentification
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                        Déverrouillage de <strong>{targetDevice.name}</strong>
                        <div className="text-xs text-blue-600 font-mono mt-0.5">{targetDevice.ip}</div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)}
                                className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                autoFocus
                                className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 animate-in slide-in-from-top-1">
                            <Lock className="w-3.5 h-3.5" />
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading || !password}
                        className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                Vérification...
                            </>
                        ) : (
                            <>
                                <Unlock className="w-4 h-4" />
                                Déverrouiller la session
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}