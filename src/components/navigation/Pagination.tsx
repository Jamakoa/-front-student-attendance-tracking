import React from 'react';
import { 
  ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight 
  } from 'lucide-react';

interface PaginationProps {
    length: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
    length,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {

    // Calcul de la pagination
    const totalItems = length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Fonctions de navigation
    const goToFirstPage = () => onPageChange(1);
    const goToLastPage = () => onPageChange(totalPages);
    const goToPreviousPage = () => onPageChange(Math.max(currentPage - 1, 1));
    const goToNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onItemsPerPageChange(Number(e.target.value));
        onPageChange(1); // Retour à la première page lors du changement
    };




    return (
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 whitespace-nowrap">
              Lignes par page
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {startItem}-{endItem} de {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Première page"
            >
              <ChevronsLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Dernière page"
            >
              <ChevronsRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
    );
}