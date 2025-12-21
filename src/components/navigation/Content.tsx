import { LayoutDashboard, Users, ClipboardCheck, Smartphone } from 'lucide-react';
import { NavLink } from 'react-router-dom'; // <--- On utilise NavLink

const SidebarContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">{children}</div>
);

const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

// Composant de lien personnalisé
const SidebarMenuItem = ({ 
  icon: Icon, 
  label, 
  to // On remplace 'active' par 'to' (le chemin)
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
      transition-all duration-200
      ${isActive 
        ? 'bg-[#34495e] text-white border-l-4 border-blue-500' 
        : 'text-gray-300 hover:bg-[#34495e] hover:text-white border-l-4 border-transparent'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

export function Content() {
    return (
        <SidebarContent>
          <SidebarSection title="">
            <SidebarMenuItem icon={LayoutDashboard} label="Tableau de bord" to="/" />
          </SidebarSection>

          <SidebarSection title="SUIVI">
            <SidebarMenuItem icon={Users} label="Etudiant" to="/etudiants" />
          </SidebarSection>

          <SidebarSection title="EVALUATION">
            <SidebarMenuItem icon={ClipboardCheck} label="Présence" to="/presence" />
          </SidebarSection>

          <SidebarSection title="APPAREIL">
            <SidebarMenuItem icon={Smartphone} label="Appareil" to="/appareil" />
          </SidebarSection>
        </SidebarContent>
    )
}