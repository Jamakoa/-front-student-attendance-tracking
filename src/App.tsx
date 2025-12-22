import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from "./components/layouts/AppLayout";
import StudentList from "./components/features/students/Student";
import { Device } from "./components/features/devices/Device";
import { Toaster } from 'sonner';

// Pages temporaires (Placeholders) en attendant votre conception
const Dashboard = () => <div className="p-10 text-2xl font-bold text-gray-700">🚧 Tableau de bord (En construction)</div>;
const Presence = () => <div className="p-10 text-2xl font-bold text-gray-700">🚧 Gestion des présences (En construction)</div>;

function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        richColors closeButton 
        offset={49}
        toastOptions={{
            style: { 
                marginRight: '-15px', // Tu peux réduire ou augmenter ici aussi
            }
        }}
        />
      <Routes>
        {/* Le Layout enveloppe toutes les routes */}
        <Route element={<AppLayout />}>
          
          {/* Route par défaut : redirection vers le tableau de bord ou étudiants */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Vos routes */}
          <Route path="/etudiants" element={<StudentList />} />
          <Route path="/presence" element={<Presence />} />
          <Route path="/appareil" element={<Device />} />
          
          {/* Route 404 (Optionnel) */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Route>
      </Routes>
    </>
  );
}

export default App;