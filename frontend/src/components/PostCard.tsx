
import React from 'react';
import { Post } from '../types';
import { MessageSquare, Heart, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { interactionsApi } from '../services/api';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { getUserByName, user } = useApp();
  const authorUser = getUserByName(post.author);

  const [likes, setLikes] = React.useState<number>(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [commentLoading, setCommentLoading] = React.useState(false);

  // Fetch initial interaction state
  React.useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const likesData = await interactionsApi.getLikes(post.id);
        setLikes(likesData.length);
        if (user) {
          setIsLiked(likesData.some(l => l.user_id === user.id));
        }
      } catch (e) {
        console.error("Failed to fetch interactions", e);
      }
    };
    fetchInteractions();
  }, [post.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousLikes = likes;

    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      await interactionsApi.toggleLike(post.id);
    } catch (e) {
      // Revert on failure
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  const toggleComments = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation
    if (!showComments && comments.length === 0) {
      setCommentLoading(true);
      try {
        const data = await interactionsApi.getComments(post.id);
        setComments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setCommentLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const comment = await interactionsApi.createComment(post.id, newComment);
      // Manually enrich for display
      const displayComment = {
        ...comment,
        user_name: user.name,
        user_avatar: user.avatarUrl
      };
      setComments([...comments, displayComment]);
      setNewComment('');
    } catch (e) {
      console.error("Failed to post comment", e);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-shadow group animate-fade-in"
    >
      <Link to={`/post/${post.id}`} className="block">
        {post.imageUrl && (
          <div className="h-48 overflow-hidden relative">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
              <span className="text-white text-sm font-medium flex items-center">Read Article <ArrowRight size={16} className="ml-1" /></span>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
              ${post.type === 'spotlight' ? 'bg-purple-100 text-purple-700' :
                post.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>
              {post.type}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-500 text-xs font-medium">{post.date}</span>
          </div>

          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
              {authorUser ? (
                <Link
                  to={`/user/${authorUser.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center hover:text-brand-600 transition-colors"
                >
                  <span>By {post.author}</span>
                </Link>
              ) : (
                <span>By {post.author}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleLike} className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                <span className="text-xs">{likes}</span>
              </button>
              <button onClick={toggleComments} className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                <MessageSquare size={18} />
                <span className="text-xs">{comments.length > 0 ? comments.length : ''}</span>
              </button>
              <button onClick={(e) => { e.preventDefault(); }} className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 p-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          {user ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button type="submit" disabled={!newComment.trim()} className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
                Post
              </button>
            </form>
          ) : (
            <p className="text-xs text-center text-gray-500 mb-2">Log in to comment</p>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {commentLoading ? (
              <div className="text-center text-gray-400 text-xs">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-400 text-xs">No comments yet.</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {c.user_avatar && <img src={c.user_avatar} className="w-full h-full object-cover" />}
                  </div>
                  <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm border border-gray-100 flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-xs text-gray-900">{c.user_name || 'User'}</span>
                      <span className="text-[10px] text-gray-400">{new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-xs mt-1">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
