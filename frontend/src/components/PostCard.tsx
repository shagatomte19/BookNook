
import React from 'react';
import { Post } from '../types';
import { MessageSquare, Heart, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { getUserByName } = useApp();
  const authorUser = getUserByName(post.author);

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
               <button onClick={(e) => { e.preventDefault(); }} className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors">
                 <Heart size={18} />
               </button>
               <button onClick={(e) => { e.preventDefault(); }} className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                 <MessageSquare size={18} />
               </button>
               <button onClick={(e) => { e.preventDefault(); }} className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors">
                 <Share2 size={18} />
               </button>
             </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;
