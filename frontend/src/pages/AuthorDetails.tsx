
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BookCard from '../components/BookCard';
import { ChevronLeft, Feather } from 'lucide-react';

const AuthorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authors, books, getBookReviews } = useApp();
  
  const author = authors.find(a => a.id === id);
  // Find books by this author (linking by name in mock data as IDs might not perfectly align in constants without big refactor, but let's try strict first)
  // In real app, we'd use IDs. Here, we can fallback to matching string name if IDs fail, but let's assume we update data correctly or use name.
  // Actually, MOCK_BOOKS has author string name. MOCK_AUTHORS has name. Let's match by name.
  const authorBooks = author ? books.filter(b => b.author === author.name) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!author) {
    return <div className="p-20 text-center">Author not found</div>;
  }

  const getAvgRating = (bookId: string) => {
    const reviews = getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="min-h-screen bg-white">
       <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to="/authors" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 transition-colors mb-8">
          <ChevronLeft size={16} className="mr-1" /> Back to Authors
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {/* Sidebar Bio */}
           <div className="md:col-span-1">
              <div className="sticky top-24">
                <div 
                  className="mb-6 animate-fade-in"
                >
                  <img 
                    src={author.imageUrl} 
                    alt={author.name} 
                    className="w-full aspect-square object-cover rounded-2xl shadow-lg mb-6" 
                  />
                  <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{author.name}</h1>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                     <Feather size={14} className="mr-2" />
                     <span>{authorBooks.length} Published Works</span>
                  </div>
                </div>
                
                <div className="prose prose-brand text-gray-600 leading-relaxed">
                   <p>{author.bio}</p>
                </div>
              </div>
           </div>

           {/* Main Content Bibliography */}
           <div className="md:col-span-2">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                Selected Bibliography
              </h2>
              
              {authorBooks.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {authorBooks.map((book, idx) => (
                    <div
                      key={book.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <BookCard 
                        book={book} 
                        averageRating={getAvgRating(book.id)} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">
                  No books found in our database for this author yet.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetails;
