// src/components/features/students/Student.tsx
import React from 'react';
import { 
  Search, FileDown, Filter , User, MoreVertical
} from 'lucide-react';
import { useStudent } from '@/components/hooks/useStudent';
import { Pagination } from '@/components/navigation/Pagination';
import type { Student } from '@/components/model/index';
import { ActionMenu } from '@/components/features/ActionMenu';
import { ContactExpandable } from '../ContactExpandable';
import { SelectedAvatar } from '../SelectedAvatar';

function StudentList() {

  const { students } = useStudent();

  // --- ÉTATS DES FILTRES ---
  const [selectedYear, setSelectedYear] = React.useState('2024-2025');
  const [selectedNiveau, setSelectedNiveau] = React.useState('Tout');
  const [selectedParcours, setSelectedParcours] = React.useState('Tout');
  const [selectedGroupe, setSelectedGroupe] = React.useState('Tout');
  
  // État recherche
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // --- LOGIQUE DE FILTRAGE (Le cœur du système) ---
  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      // 1. Filtre Recherche (Nom, Prénom, Matricule)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === '' || 
        student.lastname.toLowerCase().includes(searchLower) ||
        student.firstname.toLowerCase().includes(searchLower) ||
        student.registration_number.toLowerCase().includes(searchLower);

      // 2. Filtre Année (Logique basée sur le début du matricule, ex: "2025")
      // On prend la 2ème année du sélecteur "2024-2025" -> "2025"
      const targetYear = selectedYear.split('-')[1]; 
      const matchesYear = student.registration_number.startsWith(targetYear);

      // 3. Filtre Niveau (Attention: nécessite que student.level soit rempli dans vos données)
      const matchesNiveau = selectedNiveau === 'Tout' || student.level?.name_level === selectedNiveau;

      // 4. Filtre Parcours (Nécessite student.course)
      const matchesParcours = selectedParcours === 'Tout' || student.course?.name_course === selectedParcours;

      // 5. Filtre Groupe (Nécessite student.group)
      const matchesGroupe = selectedGroupe === 'Tout' || student.group?.name === selectedGroupe;

      return matchesSearch && matchesYear && matchesNiveau && matchesParcours && matchesGroupe;
    });
  }, [students, searchQuery, selectedYear, selectedNiveau, selectedParcours, selectedGroupe]);


  // --- PAGINATION (Sur la liste filtrée !) ---
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(5);

  // Si on change de filtre, on revient à la page 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear, selectedNiveau, selectedParcours, selectedGroupe]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);


  // --- MODALES & MENUS ---
  const [selectedAvatar, setSelectedAvatar] = React.useState<Student | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchQuery('');
  };

  const openAvatarModal = (theStudent: Student) => setSelectedAvatar(theStudent);
  const closeAvatarModal = () => setSelectedAvatar(null);

  const toggleMenu = (registrationNumber: string) => {
    setOpenMenuId(openMenuId === registrationNumber ? null : registrationNumber);
  };

  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);


  return (
    <div className="min-h-full bg-gray-50 p-6">
      {/* Header avec filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-end mb-6">
          <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md font-medium text-sm">
            ANNÉE SÉLECTIONNÉE : {selectedYear}
          </div>
        </div>

        {/* Section des filtres */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase">Filtres</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année universitaire</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option>2024-2025</option>
                <option>2023-2024</option>
                <option>2022-2023</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={selectedNiveau}
                onChange={(e) => setSelectedNiveau(e.target.value)}
              >
                <option>Tout</option>
                <option>L1</option>
                <option>L2</option>
                <option>L3</option>
                <option>M1</option>
                <option>M2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parcours</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={selectedParcours}
                onChange={(e) => setSelectedParcours(e.target.value)}
              >
                <option>Tout</option>
                <option>GB</option>
                <option>SR</option>
                <option>IG</option>
                <option>ASR</option>
                <option>OCC</option>
                <option>GID</option>
                <option>ASI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Groupe</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                value={selectedGroupe}
                onChange={(e) => setSelectedGroupe(e.target.value)}
              >
                <option>Tout</option>
                <option>I</option>
                <option>II</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium">
            <FileDown className="w-4 h-4" />
            Exporter en Excel
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSearch}
              className={`p-2 rounded-md transition-colors ${showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {showSearch && (
              <div className="flex-1 max-w-md animate-in fade-in slide-in-from-left-2 duration-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher (Nom, Prénom, Matricule)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Photo</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Nom & Prénoms</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Date de naissance</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Contact</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">E-Mail</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Parcours</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.registration_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <button onClick={() => openAvatarModal(student)} className="relative group">
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all cursor-pointer">
                            {student.picture ? (
                              <img src={student.picture} alt={`${student.firstname} ${student.lastname}`} className="w-full h-full object-cover"/>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-blue-600 font-medium">{student.registration_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {student.lastname.toUpperCase()} {student.firstname}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-700">{student.birth_date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-700"><ContactExpandable contacts={student.contact} /></span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className="text-sm text-gray-700">{student.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* Affichage conditionnel du parcours si disponible, sinon placeholder */}
                      <span className="text-sm text-gray-900 font-medium">
                        {student.course?.name_course || "#######"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="relative inline-block">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(student.registration_number);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        {openMenuId === student.registration_number && (
                          <ActionMenu student={student} onClose={() => setOpenMenuId(null)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    Aucun étudiant trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          length={filteredStudents.length} // Pagination basée sur les résultats filtrés !
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {selectedAvatar && (
        <SelectedAvatar 
          picture={selectedAvatar.picture}
          firtsname={selectedAvatar.firstname}
          lastname={selectedAvatar.lastname}
          registration_number={selectedAvatar.registration_number}
          oncloseAvatarModal={closeAvatarModal} 
        />
      )}
    </div>
  );
}

export default StudentList;