import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import StarRating from './StarRating';

interface BookCardProps {
  book: Book;
  averageRating?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, averageRating = 0 }) => {
  return (
    <Link to={`/book/${book.id}`} className="group block h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-brand-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
          
          <div className="mb-3">
             <StarRating rating={averageRating} size={14} />
          </div>
          
          <div className="mt-auto flex flex-wrap gap-2">
            {book.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;