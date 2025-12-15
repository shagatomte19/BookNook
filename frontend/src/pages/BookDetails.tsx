import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateBookInsight } from '../services/geminiService';
import StarRating from '../components/StarRating';
import BookCard from '../components/BookCard';
import { ShoppingCart, Star, ExternalLink, Sparkles, ChevronLeft, ChevronDown, ChevronUp, User as UserIcon, Building2, Layers } from 'lucide-react';
import { Review } from '../types';
import ReactMarkdown from 'react-markdown';
import { shelvesApi, Shelf } from '../services/api';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, getBookReviews, addReview, user, isLoading } = useApp();

  const book = books.find(b => b.id === id);
  const reviews = book ? getBookReviews(book.id) : [];

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAiSectionOpen, setIsAiSectionOpen] = useState(false);
  const [myShelves, setMyShelves] = useState<Shelf[]>([]);
  const [shelfMessage, setShelfMessage] = useState<string | null>(null);
  const [isShelfDropdownOpen, setIsShelfDropdownOpen] = useState(false);
  const [shelfLoading, setShelfLoading] = useState(false);
  const [showCreateShelf, setShowCreateShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');

  // Scroll to top on mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setAiInsight(null);
    setIsAiSectionOpen(false);
    setShelfMessage(null);

    if (user) {
      shelvesApi.getUserShelves(user.id).then(setMyShelves).catch(console.error);
    }
  }, [id, user]);

  const handleAddToShelf = async (shelfId: string) => {
    if (!book) return;

    try {
      await shelvesApi.addBook(shelfId, book.id);
      setShelfMessage("Added to shelf!");
      setIsShelfDropdownOpen(false);

      if (user) {
        shelvesApi.getUserShelves(user.id).then(setMyShelves);
      }

      setTimeout(() => setShelfMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setShelfMessage("Failed to add");
    }
  };

  const handleCreateNewShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelfName.trim() || !user) return;

    try {
      const newShelf = await shelvesApi.createShelf({ name: newShelfName.trim() });
      setMyShelves([...myShelves, newShelf]);
      setNewShelfName('');
      setShowCreateShelf(false);
      setShelfMessage(`Created "${newShelfName}"!`);

      // Auto add current book to new shelf
      if (book) {
        await shelvesApi.addBook(newShelf.id, book.id);
        setShelfMessage(`Added to "${newShelfName}"!`);
        shelvesApi.getUserShelves(user.id).then(setMyShelves);
      }

      setTimeout(() => setShelfMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setShelfMessage("Failed to create shelf");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="p-20 text-center text-lg text-gray-500">Book not found.</div>;
  }

  const relatedBooks = books.filter(b =>
    b.id !== book.id && (
      b.author === book.author ||
      b.genres.some(g => book.genres.includes(g))
    )
  ).slice(0, 4);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const getRelatedAvgRating = (bookId: string) => {
    const r = getBookReviews(bookId);
    if (r.length === 0) return 0;
    return r.reduce((acc, val) => acc + val.rating, 0) / r.length;
  };

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const insight = await generateBookInsight(book.title, book.author);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0 || !user) return;

    const review: Review = {
      id: Date.now().toString(),
      bookId: book.id,
      userId: user.id,
      userName: user.name,
      rating: newReviewRating,
      content: newReviewContent,
      date: new Date().toISOString().split('T')[0]
    };

    addReview(review);
    setNewReviewContent('');
    setNewReviewRating(0);
    setShowReviewForm(false);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header / Nav Back */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Back to Discovery
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-8">
          <div className="w-full max-w-sm rounded-lg shadow-2xl overflow-hidden bg-gray-100 transform hover:scale-[1.02] transition-transform duration-500">
            <img src={book.coverUrl} alt={book.title} className="w-full h-auto object-cover" />
          </div>

          {/* Shelf Actions */}
          <div className="w-full max-w-sm relative">
            <button
              onClick={() => setIsShelfDropdownOpen(!isShelfDropdownOpen)}
              className="w-full bg-brand-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <Layers size={18} />
              <span>Add to Shelf</span>
              {isShelfDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isShelfDropdownOpen && user && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in">
                {shelfLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : myShelves.length > 0 ? (
                  <>
                    <div className="max-h-48 overflow-y-auto">
                      {myShelves.map(shelf => (
                        <button
                          key={shelf.id}
                          onClick={() => handleAddToShelf(shelf.id)}
                          disabled={shelf.items.some(i => i.book_id === book.id)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 capitalize flex justify-between items-center ${shelf.items.some(i => i.book_id === book.id)
                            ? 'bg-green-50 text-green-700 cursor-default'
                            : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                            }`}
                        >
                          <span>{shelf.name.replace(/_/g, ' ')}</span>
                          {shelf.items.some(i => i.book_id === book.id) && (
                            <span className="text-green-600 flex items-center gap-1">
                              <span className="text-xs">Added</span>
                              <span>✓</span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      {showCreateShelf ? (
                        <form onSubmit={handleCreateNewShelf} className="flex gap-2">
                          <input
                            type="text"
                            value={newShelfName}
                            onChange={(e) => setNewShelfName(e.target.value)}
                            placeholder="Shelf name..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            autoFocus
                          />
                          <button type="submit" className="px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
                            Add
                          </button>
                          <button type="button" onClick={() => setShowCreateShelf(false)} className="px-3 py-2 text-gray-500 hover:text-gray-700">
                            ✕
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowCreateShelf(true)}
                          className="w-full text-center text-sm text-brand-600 font-medium hover:text-brand-700"
                        >
                          + Create New Shelf
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 text-center mb-3">No shelves yet. Create one!</p>
                    {showCreateShelf ? (
                      <form onSubmit={handleCreateNewShelf} className="flex gap-2">
                        <input
                          type="text"
                          value={newShelfName}
                          onChange={(e) => setNewShelfName(e.target.value)}
                          placeholder="Shelf name..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          autoFocus
                        />
                        <button type="submit" className="px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
                          Create
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowCreateShelf(true)}
                        className="w-full py-2 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium hover:bg-brand-100"
                      >
                        + Create Your First Shelf
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {isShelfDropdownOpen && !user && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-20 text-center text-sm text-gray-500">
                <Link to="/login" className="text-brand-600 font-bold hover:underline">Log in</Link> to manage shelves.
              </div>
            )}

            {shelfMessage && (
              <div className={`mt-2 text-center text-sm font-medium animate-fade-in ${shelfMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {shelfMessage}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-gray-900 border-b border-gray-100 pb-2">Best Prices</h3>
            <div className="space-y-3">
              {book.priceOptions.map((option, idx) => (
                <a
                  key={idx}
                  href={option.url}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-md hover:bg-brand-50/30 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart size={18} className="text-gray-400 group-hover:text-brand-600" />
                    <span className="font-medium text-gray-700">{option.vendor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">${option.price.toFixed(2)}</span>
                    {option.inStock ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">OOS</span>
                    )}
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Reviews */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {book.genres.map(g => (
                <span key={g} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">{g}</span>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-2">by <span className="text-brand-700 font-medium">{book.author}</span> ({book.publishedYear})</p>
            {book.publisher && (
              <p className="flex items-center text-sm text-gray-500 mb-6">
                <Building2 size={14} className="mr-1.5" />
                Published by <span className="text-gray-700 font-medium ml-1">{book.publisher}</span>
              </p>
            )}

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <StarRating rating={averageRating} size={24} />
                <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{reviews.length} Reviews</span>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-8">
              {book.description}
            </p>

            {/* AI Integration Section - Collapsible */}
            <div className="border border-brand-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-8">
              <button
                onClick={() => setIsAiSectionOpen(!isAiSectionOpen)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-brand-50/50 to-white hover:bg-brand-50 transition-colors"
              >
                <div className="flex items-center space-x-2 text-brand-800">
                  <Sparkles size={20} className="text-brand-600" />
                  <h3 className="font-serif font-bold text-lg sm:text-xl">Gemini AI Insights</h3>
                </div>
                {isAiSectionOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>

              {isAiSectionOpen && (
                <div className="p-6 sm:p-8 bg-white border-t border-brand-100 animate-fade-in">
                  {!aiInsight && !loadingAi && (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                      <div className="bg-brand-100 p-3 rounded-full text-brand-600 mb-2">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium mb-1">Unlock deeper insights</p>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                          Get a comprehensive summary, key themes, and personalized recommendations powered by Gemini AI.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateInsight}
                        className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm text-sm font-medium flex items-center space-x-2"
                      >
                        <Sparkles size={16} />
                        <span>Generate Analysis</span>
                      </button>
                    </div>
                  )}

                  {loadingAi && (
                    <div className="space-y-4 animate-pulse py-2">
                      <div className="flex items-center space-x-2 text-brand-600 text-sm font-medium mb-4">
                        <Sparkles size={16} className="animate-spin" />
                        <span>Analyzing "{book.title}"...</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  )}

                  {aiInsight && (
                    <div className="prose prose-sm sm:prose-base prose-brand max-w-none text-gray-700">
                      <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Books Section */}
          <div className="border-t border-gray-200 pt-10 pb-8">
            <div className="flex items-center mb-6">
              <Layers size={20} className="mr-2 text-brand-600" />
              <h2 className="text-2xl font-serif font-bold text-gray-900">Related Books</h2>
            </div>
            {relatedBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedBooks.map((relatedBook, idx) => (
                  <div
                    key={relatedBook.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <BookCard book={relatedBook} averageRating={getRelatedAvgRating(relatedBook.id)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No similar books found in the library yet.</p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Community Reviews</h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-brand-600 hover:text-brand-800 font-medium text-sm underline underline-offset-4"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              )}
            </div>

            {showReviewForm && user && (
              <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-xl mb-8 animate-fade-in">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <StarRating
                    rating={newReviewRating}
                    interactive
                    onRate={setNewReviewRating}
                    size={24}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="What did you think about this book?"
                    value={newReviewContent}
                    onChange={(e) => setNewReviewContent(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={newReviewRating === 0}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Post Review
                </button>
              </form>
            )}

            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {review.userName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900">{review.userName}</h4>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <div className="mb-2">
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.content}</p>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;