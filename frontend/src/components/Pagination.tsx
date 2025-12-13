import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-12 mb-8 animate-fade-in">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
        Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="text-gray-500">{totalPages}</span>
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;