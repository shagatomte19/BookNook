
import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { BookOpen, Calendar, MapPin, PenTool, UserPlus, UserCheck, MessageCircle, Layers } from 'lucide-react';
import PostCard from '../components/PostCard';
import { shelvesApi, Shelf } from '../services/api';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, getUserById, getUserReviews, books, posts, followUser, unfollowUser } = useApp();
  const navigate = useNavigate();

  const [shelves, setShelves] = React.useState<Shelf[]>([]);

  React.useEffect(() => {
    if (userId) {
      shelvesApi.getUserShelves(userId).then(setShelves).catch(console.error);
    }
  }, [userId]);

  const profileUser = getUserById(userId || '');

  if (!profileUser) {
    return <div className="p-20 text-center">User not found</div>;
  }

  const isMe = currentUser?.id === profileUser.id;
  const isFollowing = currentUser?.following?.includes(profileUser.id);

  const userReviews = getUserReviews(profileUser.id);
  const userPosts = posts.filter(p => p.author === profileUser.name);

  const getBookForReview = (bookId: string) => books.find(b => b.id === bookId);

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(profileUser.id);
    } else {
      followUser(profileUser.id);
    }
  };

  const handleMessage = () => {
    // Navigate to messages with this user pre-selected
    navigate(`/messages?userId=${profileUser.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{profileUser.name}</h1>
              <p className="text-gray-600 mb-4 max-w-lg">{profileUser.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {profileUser.joinedDate}</span>
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

              {!isMe && (
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center transition-all ${isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                      }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={18} className="mr-2" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="mr-2" /> Follow
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleMessage}
                    className="px-6 py-2 rounded-xl font-bold text-sm flex items-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={18} className="mr-2" /> Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-serif font-bold text-gray-900 mb-4">Community</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-bold text-gray-900">{profileUser.followers.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Following</span>
                  <span className="font-bold text-gray-900">{profileUser.following.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Shelves Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Layers size={20} className="mr-2 text-brand-600" />
                Bookshelves
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelves.length > 0 ? (
                  shelves.map(shelf => (
                    <div key={shelf.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-serif font-bold text-lg text-gray-900 capitalize">{shelf.name.replace(/_/g, ' ')}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{shelf.items.length} books</span>
                      </div>
                      <div className="flex -space-x-2 overflow-hidden py-2 pl-2">
                        {shelf.items.slice(0, 5).map((item, idx) => {
                          // Try to find book in global context if not populated
                          const cover = item.book?.cover_url || books.find(b => b.id === item.book_id)?.coverUrl;
                          if (!cover) return (
                            <div key={item.id} className="inline-block h-12 w-8 rounded-sm bg-gray-200 ring-2 ring-white" title="Unknown Book"></div>
                          );
                          return (
                            <img
                              key={item.id}
                              className="inline-block h-16 w-12 rounded-sm ring-2 ring-white object-cover"
                              src={cover}
                              alt="Book Cover"
                              title={item.book?.title}
                            />
                          );
                        })}
                        {shelf.items.length > 5 && (
                          <div className="flex items-center justify-center h-16 w-12 rounded-sm ring-2 ring-white bg-gray-100 text-xs text-gray-500 font-medium">
                            +{shelf.items.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white p-8 rounded-xl border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm">No shelves created yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Articles Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PenTool size={20} className="mr-2 text-brand-600" />
                Articles
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
                    <p className="text-gray-500 text-sm">No articles published yet.</p>
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
                    <p className="text-gray-500">No reviews yet.</p>
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

export default UserProfile;
