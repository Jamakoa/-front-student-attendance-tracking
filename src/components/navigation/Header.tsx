import logoENI from '../../assets/logo-eni-rond.png';

const SidebarHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b border-gray-700">{children}</div>
);

export function Header() {
    return (
        <SidebarHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-500/20">
                <img src={logoENI} alt="Logo ENI" className="w-18 h-18" />
            </div>
            {/* Titre */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-wide">E-NGITRIKA</h1>
              {/* <p className="text-xs text-gray-400 mt-1">Système de gestion</p> */}
            </div>
          </div>
        </SidebarHeader>
    ); 
}