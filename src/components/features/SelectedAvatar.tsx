import { 
    User, X
} from 'lucide-react'

interface SelectedAvatarProps {
    oncloseAvatarModal: () => void;
    picture: string;
    firtsname: string;
    lastname: string;
    registration_number: string;
}


export function SelectedAvatar({ 
    picture, oncloseAvatarModal, firtsname, lastname, registration_number 
}: SelectedAvatarProps) {
  return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={oncloseAvatarModal}
        >
          <button
            onClick={oncloseAvatarModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl w-full animate-in zoom-in duration-200">
            {picture ? (
              <img 
                src={picture} 
                alt={lastname + ' ' + firtsname}
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-lg">
                <User className="w-48 h-48 text-white opacity-90" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
              <p className="text-white font-semibold text-xl">
                {lastname.toUpperCase()} {firtsname}
              </p>
              <p className="text-gray-300 text-sm">
                {registration_number}
              </p>
            </div>
          </div>
        </div>
  );
}