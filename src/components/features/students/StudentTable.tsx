import React from 'react';
import { Search, MoreVertical } from "lucide-react";
import { Pagination } from "@/components/navigation/Pagination";

export function StudentTable() {

    // État pour afficher/masquer la barre de recherche
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (showSearch) {
        setSearchQuery('');
        }
    };

  return (
    <div className="bg-white rounded-lg shadow-sm">
        {/* Barre d'outils avec recherche toggleable */}
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
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un étudiant..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Photo
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Nom & Prénoms
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Date de naissance
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  E-Mail
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Parcours
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map((student) => (
                <tr key={student.getRegistrationNumber()} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <button
                        onClick={() => openAvatarModal(student)}
                        className="relative group"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all cursor-pointer">
                          {student.getPicture() ? (
                            <img 
                              src={student.getPicture()} 
                              alt={`${student.getFirstname()} ${student.getLastname()}`}
                              className="w-full h-full object-cover"
                            />
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
                    <span className="text-sm text-blue-600 font-medium">{student.getRegistrationNumber()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {student.getLastname().toUpperCase()} {student.getFirstname()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{student.getBirthDate()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{<ContactExpandable contacts={student.getContact()} />}</span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span className="text-sm text-gray-700">{student.getEmail()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900 font-medium">{"#######"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative inline-block">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(student.getRegistrationNumber());
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {openMenuId === student.getRegistrationNumber() && (
                        <ActionMenu 
                          student={student} 
                          onClose={() => setOpenMenuId(null)} 
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination responsive */}
        <Pagination 
          length={students.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
    </div>
    );
}   