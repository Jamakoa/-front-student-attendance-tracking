import React from 'react';
import { Menu, ArrowLeftToLine } from 'lucide-react';
import { Header } from '../navigation/Header';
import { Content } from '../navigation/Content';
import { Footer } from '../navigation/Footer';
import { Outlet } from 'react-router-dom';

// Simuler les composants shadcn/ui sidebar
const SidebarProvider = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-gray-100 overflow-hidden">{children}</div>
);

interface SidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const Sidebar = ({ children, isOpen }: SidebarProps) => (
  <aside 
    className={`
      bg-[#2c3e50] text-gray-200 flex flex-col shadow-xl
      transition-all duration-300 ease-in-out
      fixed lg:relative inset-y-0 left-0 z-40
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isOpen ? 'w-64' : 'w-64 lg:w-0'}
    `}
  >
    <div className={`${isOpen ? 'flex' : 'hidden lg:hidden'} flex-col h-full overflow-y-auto scrollbar-dark `}>
      {children}
    </div>
  </aside>
);

interface OverlayProps {
  isOpen: boolean;
  onClick: () => void;
}

const Overlay = ({ isOpen, onClick }: OverlayProps) => (
  <div
    className={`
      fixed inset-0 bg-black/50 z-30 lg:hidden
      transition-opacity duration-300
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}
    onClick={onClick}
  />
);

export function AppLayout() {
    // Récupérer l'état initial depuis localStorage ou défaut basé sur la taille d'écran
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) {
            return JSON.parse(saved);
        }
        // Par défaut: ouvert sur desktop, fermé sur mobile
        return window.innerWidth >= 1024;
    });

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

    // Sauvegarder l'état dans localStorage à chaque changement
    React.useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    // Détecter le changement de taille d'écran
    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            
            // Sur mobile, fermer automatiquement si on redimensionne
            if (mobile && isSidebarOpen) {
                // Ne pas fermer automatiquement, laisser l'utilisateur décider
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <SidebarProvider>
            {/* Overlay pour mobile */}
            <Overlay isOpen={isSidebarOpen && isMobile} onClick={closeSidebar} />
            
            <Sidebar isOpen={isSidebarOpen}>
                <Header />
                <Content />
                <Footer />
            </Sidebar>
            
            <main className="flex-1 overflow-auto relative w-full scrollbar-hide">
                {/* Bouton Toggle */}
                <button
                    onClick={toggleSidebar}
                    className={`
                        fixed top-4 z-50 p-2.5 bg-white rounded-lg shadow-lg 
                        hover:bg-gray-100 transition-all duration-300
                        ${isSidebarOpen && !isMobile ? 'left-[272px]' : 'left-4'}
                    `}
                    title={isSidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
                    aria-label={isSidebarOpen ? 'Masquer le menu' : 'Afficher le menu'}
                >
                    {isSidebarOpen ? (
                        <ArrowLeftToLine className="w-5 h-5 text-gray-700" />
                    ) : (
                        <Menu className="w-5 h-5 text-gray-700" />
                    )}
                </button>
                
                <Outlet />
            </main>
        </SidebarProvider>
    );
}