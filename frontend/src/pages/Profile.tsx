
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { BookOpen, Calendar, MapPin, PenTool, Shield, Edit, User as UserIcon, BookMarked, Check, Layers } from 'lucide-react';
import { shelvesApi, Shelf } from '../services/api';

// Reading status shelf names
const READING_STATUS_SHELVES = {
  WANT_TO_READ: 'want_to_read',
  CURRENTLY_READING: 'currently_reading',
  READ: 'read'
};

const Profile: React.FC = () => {
  const { user, getUserReviews, books, posts } = useApp();
  const userReviews = getUserReviews(user.id);
  const userPosts = posts.filter(p => p.author === user.name);

  const [myShelves, setMyShelves] = useState<Shelf[]>([]);
  const [activeShelfTab, setActiveShelfTab] = useState<'status' | 'custom'>('status');

  // Fetch user shelves
  useEffect(() => {
    if (user) {
      shelvesApi.getUserShelves(user.id).then(setMyShelves).catch(console.error);
    }
  }, [user]);

  // Calculate reading stats
  const wantToReadShelf = myShelves.find(s => s.name === READING_STATUS_SHELVES.WANT_TO_READ);
  const currentlyReadingShelf = myShelves.find(s => s.name === READING_STATUS_SHELVES.CURRENTLY_READING);
  const readShelf = myShelves.find(s => s.name === READING_STATUS_SHELVES.READ);

  const wantToReadCount = wantToReadShelf?.items.length || 0;
  const currentlyReadingCount = currentlyReadingShelf?.items.length || 0;
  const readCount = readShelf?.items.length || 0;

  // Custom shelves (non-status)
  const statusShelfNames = Object.values(READING_STATUS_SHELVES);
  const customShelves = myShelves.filter(s => !statusShelfNames.includes(s.name as any));

  // Helper to find book details for a review
  const getBookForReview = (bookId: string) => books.find(b => b.id === bookId);

  // Display nickname if available, otherwise fall back to name
  const displayName = user.nickname || user.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-serif font-bold text-gray-900">{displayName}</h1>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Edit Profile
                </Link>
              </div>

              {/* Show original name if nickname is different */}
              {user.nickname && user.nickname !== user.name && (
                <p className="text-sm text-gray-500 mb-2">@{user.name}</p>
              )}

              <p className="text-gray-600 mb-4 max-w-lg">{user.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500">
                {user.age && (
                  <div className="flex items-center gap-1">
                    <UserIcon size={16} />
                    <span>{user.age} years old</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {user.joinedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>{userReviews.length} Reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <PenTool size={16} />
                  <span>{userPosts.length} Articles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Reading Status Cards */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-serif font-bold text-gray-900 mb-4">Reading Status</h3>
              <div className="space-y-3">
                <Link
                  to="#"
                  className="flex justify-between items-center p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookMarked size={18} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Want to Read</span>
                  </div>
                  <span className="font-bold text-amber-600">{wantToReadCount}</span>
                </Link>

                <Link
                  to="#"
                  className="flex justify-between items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Currently Reading</span>
                  </div>
                  <span className="font-bold text-blue-600">{currentlyReadingCount}</span>
                </Link>

                <Link
                  to="#"
                  className="flex justify-between items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Read</span>
                  </div>
                  <span className="font-bold text-green-600">{readCount}</span>
                </Link>
              </div>
            </div>

            {/* My Shelves */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-brand-600" />
                  My Shelves
                </h3>
                <span className="text-xs text-gray-400">{customShelves.length} shelves</span>
              </div>

              {customShelves.length > 0 ? (
                <div className="space-y-2">
                  {customShelves.map(shelf => (
                    <div
                      key={shelf.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium text-gray-700 capitalize">{shelf.name.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-400">{shelf.items.length} books</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No custom shelves yet. Create one from a book page!</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-serif font-bold text-gray-900 mb-4">Favorite Genres</h3>
              <div className="flex flex-wrap gap-2">
                {['Sci-Fi', 'Mystery', 'History', 'Tech'].map(g => (
                  <span key={g} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{g}</span>
                ))}
              </div>
            </div>


          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* User Articles Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PenTool size={20} className="mr-2 text-brand-600" />
                My Articles
              </h2>
              <div className="space-y-4">
                {userPosts.length > 0 ? (
                  userPosts.map(post => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-1 rounded-md">{post.type}</span>
                        <span className="text-xs text-gray-400">{post.date}</span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                    </Link>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm mb-2">You haven't written any articles yet.</p>
                    <Link to="/" className="text-brand-600 font-medium text-sm hover:underline">Write your first article</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen size={20} className="mr-2 text-brand-600" />
                Recent Reviews
              </h2>

              <div className="space-y-6">
                {userReviews.length > 0 ? (
                  userReviews.map(review => {
                    const book = getBookForReview(review.bookId);
                    if (!book) return null;

                    return (
                      <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 hover:shadow-md transition-shadow">
                        <Link to={`/book/${book.id}`} className="shrink-0 hidden sm:block">
                          <img src={book.coverUrl} alt={book.title} className="w-20 h-32 object-cover rounded shadow-sm" />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/book/${book.id}`} className="hover:text-brand-600 transition-colors">
                            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">{book.title}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">Reviewed on {review.date}</p>
                          <div className="mb-3">
                            <StarRating rating={review.rating} size={16} />
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white p-10 rounded-xl shadow-sm text-center">
                    <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
                    <Link to="/" className="text-brand-600 font-medium hover:underline">Browse books to review</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
