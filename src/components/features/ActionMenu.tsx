import { 
  Eye, Edit, Trash2, UserCheck, Mail, Phone
} from 'lucide-react'
import type { Student } from '@/components/model/Student';

export function ActionMenu({ student, onClose }: { student: Student; onClose: () => void }) {
  
  const handleAction = (action: string) => {
    console.log(`Action "${action}" pour:`, student.registration_number);
    onClose();
    // Ajoutez ici votre logique
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 animate-in fade-in zoom-in duration-150">
      <button
        onClick={() => handleAction('voir')}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
      >
        <Eye className="w-4 h-4" />
        Voir le profil
      </button>
      
      <button
        onClick={() => handleAction('modifier')}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
      >
        <Edit className="w-4 h-4" />
        Modifier
      </button>
      
      <button
        onClick={() => handleAction('presence')}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-3 transition-colors"
      >
        <UserCheck className="w-4 h-4" />
        Marquer présent
      </button>

      <div className="border-t border-gray-100 my-1"></div>
      
      <button
        onClick={() => handleAction('email')}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Envoyer un email
      </button>
      
      <button
        onClick={() => handleAction('appeler')}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
      >
        <Phone className="w-4 h-4" />
        Appeler
      </button>

      <div className="border-t border-gray-100 my-1"></div>
      
      <button
        onClick={() => handleAction('supprimer')}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Supprimer
      </button>
    </div>
  );
}