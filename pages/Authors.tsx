
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

const Authors: React.FC = () => {
  const { authors, books } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const totalPages = Math.ceil(authors.length / ITEMS_PER_PAGE);
  const currentAuthors = authors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-50/30">
      <div className="bg-white border-b border-brand-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-black text-gray-900 mb-4">Featured Authors</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the minds behind your favorite stories. Explore their biographies and discover their complete works.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentAuthors.map((author, index) => {
             // Find one book cover to display as background/context
             const featuredBook = books.find(b => author.topBookIds.includes(b.id));

             return (
               <div
                 key={author.id}
                 className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full animate-fade-in"
               >
                 <div className="h-32 bg-brand-200 relative overflow-hidden">
                    {featuredBook ? (
                        <img 
                          src={featuredBook.coverUrl} 
                          className="w-full h-full object-cover opacity-30 blur-sm scale-110 group-hover:scale-100 transition-transform duration-700"
                          alt="" 
                        />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-brand-200 to-brand-100" />
                    )}
                 </div>
                 
                 <div className="px-6 pb-6 flex-1 flex flex-col relative">
                    <div className="-mt-12 mb-4">
                      <img 
                        src={author.imageUrl} 
                        alt={author.name} 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white" 
                      />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-700 transition-colors">
                      {author.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
                      {author.born ? `Born ${author.born}` : 'Author'}
                    </p>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {author.bio}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <Link 
                        to={`/author/${author.id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-50 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    </div>
  );
};

export default Authors;
