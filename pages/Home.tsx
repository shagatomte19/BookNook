
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import StarRating from '../components/StarRating';
import { TrendingUp, Sparkles, PenTool, X, Image as ImageIcon, BookOpen, ChevronRight, Users } from 'lucide-react';
import { Post } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { posts, books, reviews, user, addPost, allUsers } = useApp();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');

  // Form State
  const [postTitle, setPostTitle] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postTags, setPostTags] = useState('');

  // Trending Books: Top 5 based on mock logic
  const trendingBooks = books.slice(0, 5);

  // Featured posts for sidebar: specifically look for Spotlight or News
  const featuredPosts = posts.filter(p => p.type === 'spotlight' || p.type === 'news').slice(0, 3);

  // Calculate rating for book cards
  const getAvgRating = (bookId: string) => {
    const bookReviews = reviews.filter((r) => r.bookId === bookId);
    if (bookReviews.length === 0) return 0;
    const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / bookReviews.length;
  };

  // Filter posts based on tab
  const getFilteredPosts = () => {
    if (feedTab === 'all') return posts;
    
    // Get list of names of followed users (since Post only has author name)
    const followedIds = user.following || [];
    const followedNames = allUsers
      .filter(u => followedIds.includes(u.id))
      .map(u => u.name);
      
    // Also include own posts
    followedNames.push(user.name);

    return posts.filter(p => followedNames.includes(p.author));
  };

  const displayedPosts = getFilteredPosts();

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Post = {
      id: `p${Date.now()}`,
      type: 'blog',
      title: postTitle,
      excerpt: postExcerpt,
      content: postContent,
      author: user.name,
      date: 'Just now',
      imageUrl: postImage || 'https://picsum.photos/seed/new/800/400',
      tags: postTags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    addPost(newPost);
    setIsPostModalOpen(false);
    // Reset form
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
    setPostImage('');
    setPostTags('');
  };

  return (
    <div className="min-h-screen bg-brand-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8">
             {/* Write Article Section */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 mb-8 transform transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-brand-100" />
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="flex-1 text-left bg-gray-50 hover:bg-gray-100 text-gray-500 py-3 px-4 rounded-xl transition-colors font-medium border border-transparent hover:border-gray-200"
                  >
                    Share your thoughts or review a book...
                  </button>
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="p-3 text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                  >
                    <PenTool size={20} />
                  </button>
                </div>
             </div>

             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setFeedTab('all')}
                    className={`flex items-center space-x-2 text-lg font-serif font-bold transition-colors ${feedTab === 'all' ? 'text-brand-600 border-b-2 border-brand-600 pb-1' : 'text-gray-400 hover:text-gray-600 pb-1'}`}
                  >
                    <Sparkles size={20} />
                    <span>For You</span>
                  </button>
                  <button 
                    onClick={() => setFeedTab('following')}
                    className={`flex items-center space-x-2 text-lg font-serif font-bold transition-colors ${feedTab === 'following' ? 'text-brand-600 border-b-2 border-brand-600 pb-1' : 'text-gray-400 hover:text-gray-600 pb-1'}`}
                  >
                    <Users size={20} />
                    <span>Following</span>
                  </button>
                </div>
                <span className="text-sm text-gray-500 font-medium hidden sm:block">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
             </div>

             <div className="space-y-6">
               {displayedPosts.length > 0 ? (
                 displayedPosts.map((post) => (
                   <PostCard key={post.id} post={post} />
                 ))
               ) : (
                 <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm">
                   <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                     <Users size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                   <p className="text-gray-500">
                     {feedTab === 'following' 
                       ? "You aren't following anyone who has posted recently. Try finding authors or users to follow!" 
                       : "Check back later for new updates."}
                   </p>
                 </div>
               )}
             </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* Trending Books - Compact List */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                 <div className="flex items-center space-x-2">
                    <TrendingUp className="text-brand-600" size={20} />
                    <h2 className="font-serif font-bold text-gray-900">Trending Now</h2>
                 </div>
                 <Link to="/search" className="text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wide">View All</Link>
               </div>
               
               <div className="space-y-1">
                 {trendingBooks.map((book, index) => (
                   <Link key={book.id} to={`/book/${book.id}`} className="flex items-center space-x-4 group p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                      <span className={`font-serif font-black text-2xl w-6 text-center transition-colors ${index < 3 ? 'text-brand-300 group-hover:text-brand-500' : 'text-gray-200 group-hover:text-gray-400'}`}>
                        {index + 1}
                      </span>
                      <div className="relative w-12 h-16 flex-shrink-0 shadow-sm rounded overflow-hidden">
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-sm group-hover:text-brand-600 transition-colors">{book.title}</h4>
                        <p className="text-xs text-gray-500 truncate mb-1">{book.author}</p>
                        <StarRating rating={getAvgRating(book.id)} size={10} />
                      </div>
                   </Link>
                 ))}
               </div>
               
               <button className="w-full mt-4 py-2 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-brand-600 transition-colors uppercase tracking-wide group">
                  See Full Top 100 <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
               </button>
             </div>

             {/* Must Read Articles */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 sticky top-24">
                <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
                  <BookOpen className="text-brand-600" size={20} />
                  <h2 className="font-serif font-bold text-gray-900">Must Read</h2>
                </div>
                <div className="space-y-6">
                   {featuredPosts.map(post => (
                     <Link key={post.id} to={`/post/${post.id}`} className="flex gap-4 group items-start">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm">
                           {post.imageUrl ? (
                              <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                 <ImageIcon size={20} />
                              </div>
                           )}
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                           <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2
                              ${post.type === 'spotlight' ? 'bg-purple-50 text-purple-600' : 
                                post.type === 'news' ? 'bg-blue-50 text-blue-600' : 'bg-brand-50 text-brand-600'}`}>
                              {post.type}
                           </span>
                           <h4 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                              {post.title}
                           </h4>
                           <p className="text-xs text-gray-500 truncate">By {post.author}</p>
                        </div>
                     </Link>
                   ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50">
                   <div className="bg-brand-50 p-4 rounded-xl">
                      <p className="text-xs font-medium text-brand-800 mb-2">Want to contribute?</p>
                      <button 
                        onClick={() => setIsPostModalOpen(true)}
                        className="w-full py-2 bg-white border border-brand-200 text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-600 hover:text-white hover:border-transparent transition-all"
                      >
                         Write an Article
                      </button>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            onClick={() => setIsPostModalOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-fade-in"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="text-xl font-bold text-gray-900 font-serif">Write an Article</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Give your story a headline"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-lg font-bold placeholder-gray-400"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="A short summary to hook readers..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    value={postExcerpt}
                    onChange={e => setPostExcerpt(e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute top-3 left-3 text-gray-400" size={18} />
                        <input 
                           type="url" 
                           className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                           placeholder="https://..."
                           value={postImage}
                           onChange={e => setPostImage(e.target.value)}
                        />
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input 
                    type="text" 
                    placeholder="Review, Fantasy, Opinion..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={postTags}
                    onChange={e => setPostTags(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown Supported)</label>
                  <textarea 
                    rows={12}
                    required
                    placeholder="Tell your story..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm bg-gray-50"
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all font-medium"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
