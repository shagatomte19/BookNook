
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { Search as SearchIcon, Filter } from 'lucide-react';

const Search: React.FC = () => {
  const { books, getBookReviews } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Extract all unique genres
  const allGenres = Array.from(new Set(books.flatMap(b => b.genres))).sort();

  const getAvgRating = (bookId: string) => {
    const reviews = getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre ? b.genres.includes(selectedGenre) : true;
    return matchesSearch && matchesGenre;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

  // Calculate pagination slice
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
             {/* Search Bar */}
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all shadow-sm text-lg"
                  placeholder="Search titles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {/* Genre Pills */}
             <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-gray-400 text-sm mr-2">
                  <Filter size={16} className="mr-1" />
                  <span>Filter:</span>
                </div>
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !selectedGenre 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedGenre === genre 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">
             {selectedGenre ? `${selectedGenre} Books` : 'All Books'}
           </h2>
           <span className="text-gray-500 text-sm">
             Showing {currentBooks.length} of {filteredBooks.length} results
           </span>
        </div>

        {filteredBooks.length > 0 ? (
          <>
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
            >
                {currentBooks.map((book) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                  >
                    <BookCard 
                      book={book} 
                      averageRating={getAvgRating(book.id)}
                    />
                  </div>
                ))}
            </div>

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        ) : (
          <div className="text-center py-24 flex flex-col items-center animate-fade-in">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
               <SearchIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No books found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any books matching "{searchTerm}" {selectedGenre ? `in ${selectedGenre}` : ''}.
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedGenre(null); }}
              className="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
