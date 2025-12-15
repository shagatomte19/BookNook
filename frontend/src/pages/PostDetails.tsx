import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Calendar, User, Tag, Share2, Heart, Clock, ThumbsDown, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { interactionsApi } from '../services/api';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, isLoading, user, getUserByName } = useApp();

  const post = id ? getPost(id) : undefined;
  const authorUser = post ? getUserByName(post.author) : null;

  // Interaction states
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch interactions
  useEffect(() => {
    if (!post) return;

    const fetchInteractions = async () => {
      try {
        const likesData = await interactionsApi.getLikes(post.id);
        setLikes(likesData.length);
        if (user) {
          setIsLiked(likesData.some(l => l.user_id === user.id));
        }

        const commentsData = await interactionsApi.getComments(post.id);
        setComments(commentsData);
      } catch (e) {
        console.error("Failed to fetch interactions", e);
      }
    };
    fetchInteractions();
  }, [post?.id, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    if (isDisliked) setIsDisliked(false);

    const previousLiked = isLiked;
    const previousLikes = likes;
    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      await interactionsApi.toggleLike(post.id);
    } catch (e) {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  const handleDislike = () => {
    if (!user) return;
    if (isLiked) {
      setIsLiked(false);
      setLikes(likes - 1);
    }
    setIsDisliked(!isDisliked);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !post) return;

    try {
      const comment = await interactionsApi.createComment(post.id, newComment);
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

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Post not found</h2>
        <Link to="/" className="text-brand-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Image */}
      {post.imageUrl ? (
        <div className="w-full h-[40vh] sm:h-[50vh] relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
          <div className="absolute top-6 left-0 right-0 px-4 max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm hover:bg-white/30 transition-colors">
              <ChevronLeft size={16} className="mr-1" /> Back to Feed
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white
                  ${post.type === 'spotlight' ? 'bg-purple-600/80' :
                  post.type === 'news' ? 'bg-blue-600/80' : 'bg-brand-600/80'}`}>
                {post.type}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-serif font-black text-white leading-tight mb-4 shadow-black drop-shadow-lg animate-fade-in"
            >
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm sm:text-base font-medium">
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                {post.date}
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                5 min read
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-brand-900 text-white pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-brand-200 hover:text-white mb-8">
              <ChevronLeft size={16} className="mr-1" /> Back to Feed
            </Link>
            <h1 className="text-4xl font-serif font-bold mb-6">{post.title}</h1>
            <div className="flex items-center space-x-6 text-brand-200">
              <span>By {post.author}</span>
              <span>{post.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">

          {/* Action Bar */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <Tag size={12} className="mr-1" /> {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                <span className="text-sm font-medium">{likes > 0 ? likes : ''}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isDisliked ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
              >
                <ThumbsDown size={20} fill={isDisliked ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <MessageSquare size={20} />
                <span className="text-sm font-medium">{comments.length > 0 ? comments.length : ''}</span>
              </button>
              <button className="flex items-center px-3 py-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <article className="prose prose-lg prose-brand prose-headings:font-serif prose-headings:font-bold text-gray-900 leading-relaxed prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900 prose-a:text-brand-600">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>

          {/* Author Footer */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {authorUser ? (
                <Link to={`/user/${authorUser.id}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                  <img src={authorUser.avatarUrl} alt={authorUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                  <div>
                    <p className="font-bold text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-500">View Profile →</p>
                  </div>
                </Link>
              ) : (
                <>
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xl">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Written by {post.author}</p>
                    <p className="text-sm text-gray-500">BookNook Contributor</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-serif font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-600" />
                Comments ({comments.length})
              </h3>

              {user ? (
                <form onSubmit={handleSubmitComment} className="flex gap-3 mb-6">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-center text-gray-500 text-sm mb-6">
                  <Link to="/login" className="text-brand-600 font-medium">Log in</Link> to comment
                </p>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be the first!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {c.user_avatar && <img src={c.user_avatar} className="w-full h-full object-cover" />}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-sm text-gray-900">{c.user_name || 'User'}</span>
                          <span className="text-xs text-gray-400">{new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
