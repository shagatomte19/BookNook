
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getBookRecommendations } from '../services/geminiService';
import BookCard from '../components/BookCard';
import { Sparkles, Plus, X, BookOpen, Loader } from 'lucide-react';
import { Book } from '../types';

const Recommendations: React.FC = () => {
  const { books, getBookReviews } = useApp();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAddPreference = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && preferences.length < 5) {
      setPreferences([...preferences, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleGetRecommendations = async () => {
    if (preferences.length === 0) return;

    setIsGenerating(true);
    setHasSearched(true);
    setRecommendations([]);

    try {
      // Logic: Send preferences and ALL books to the service (RAG)
      const recommendedIds = await getBookRecommendations(preferences, books);
      
      // Filter the actual book objects based on returned IDs
      const resultBooks = books.filter(b => recommendedIds.includes(b.id));
      
      // Sort them to match the order returned by AI (relevance)
      const sortedBooks = resultBooks.sort((a, b) => {
        return recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id);
      });

      setRecommendations(sortedBooks);
    } catch (error) {
      console.error("Failed to get recommendations", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAvgRating = (bookId: string) => {
    const reviews = getBookReviews(bookId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="min-h-screen bg-brand-50/30">
      <div className="bg-white border-b border-brand-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full text-brand-700 mb-6">
            <Sparkles size={24} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 mb-4">AI Book Concierge</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Tell us what you're in the mood for. Add up to 5 preferences (genres, themes, authors, or vibes), and our AI will curate a reading list just for you.
          </p>

          {/* Input Area */}
          <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex items-center">
            <input 
              type="text" 
              className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 outline-none"
              placeholder={preferences.length >= 5 ? "Limit reached (5/5)" : "e.g., 'Cyberpunk mystery', 'Strong female lead'..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()}
              disabled={preferences.length >= 5 || isGenerating}
            />
            <button 
              onClick={() => handleAddPreference()}
              disabled={!inputValue.trim() || preferences.length >= 5 || isGenerating}
              className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-brand-100 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 min-h-[40px]">
              {preferences.map((pref, index) => (
                <div
                  key={index}
                  className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm animate-fade-in"
                >
                  {pref}
                  <button 
                    onClick={() => removePreference(index)}
                    className="ml-2 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                    disabled={isGenerating}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            {preferences.length === 0 && (
              <span className="text-gray-400 text-sm italic py-2">Add filters above to start...</span>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleGetRecommendations}
              disabled={preferences.length === 0 || isGenerating}
              className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center mx-auto"
            >
              {isGenerating ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" /> Curating Library...
                </>
              ) : (
                <>
                  <BookOpen size={20} className="mr-2" /> Get Recommendations
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hasSearched && !isGenerating && (
          <div
            className="animate-fade-in"
          >
             <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 flex items-center">
                {recommendations.length > 0 ? (
                  <>Found {recommendations.length} Matches For You</>
                ) : (
                  <>No exact matches found. Try broadening your terms.</>
                )}
             </h2>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                {recommendations.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    averageRating={getAvgRating(book.id)}
                  />
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
