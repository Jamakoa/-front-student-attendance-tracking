import React from 'react';
import { User, Settings, HelpCircle, LogOut, ChevronUp, Globe, Info, CreditCard } from 'lucide-react';

const SidebarFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-auto border-t border-gray-700 bg-[#1a252f] relative">{children}</div>
);

export function Footer() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fermer le menu si on clique en dehors
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <SidebarFooter>
      <div className="user-menu-container relative">
        {/* Menu flottant (Popup) */}
        {isMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#34495e] rounded-lg shadow-2xl border border-gray-600 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* En-tête du menu */}
            <div className="px-4 py-3 border-b border-gray-600">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Menu
              </p>
            </div>

            {/* Options du menu */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2c3e50] transition-colors group">
                <Settings className="w-4 h-4 text-gray-400 group-hover:text-white" />
                <span className="flex-1 text-left">Paramètres</span>
                <span className="text-xs text-gray-500">⌘,</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2c3e50] transition-colors group">
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-white" />
                <span className="flex-1 text-left">Langue</span>
                <ChevronUp className="w-3 h-3 text-gray-500 -rotate-90" />
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2c3e50] transition-colors group">
                <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-white" />
                <span className="flex-1 text-left">Aide</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2c3e50] transition-colors group">
                <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-white" />
                <span className="flex-1 text-left">Plan d'abonnement</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2c3e50] transition-colors group">
                <Info className="w-4 h-4 text-gray-400 group-hover:text-white" />
                <span className="flex-1 text-left">En savoir plus</span>
                <ChevronUp className="w-3 h-3 text-gray-500 -rotate-90" />
              </button>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-600"></div>

            {/* Déconnexion */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors group">
                <LogOut className="w-4 h-4" />
                <span className="flex-1 text-left">Déconnexion</span>
              </button>
            </div>
          </div>
        )}

        {/* Bouton utilisateur principal */}
        <button
          onClick={toggleMenu}
          className="w-full p-4 hover:bg-[#34495e] transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">Utilisateur</p>
              <p className="text-xs text-gray-400 truncate">Admin</p>
            </div>
            <ChevronUp 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isMenuOpen ? '' : 'rotate-180'
              }`}
            />
          </div>
        </button>
      </div>
    </SidebarFooter>
  );
}