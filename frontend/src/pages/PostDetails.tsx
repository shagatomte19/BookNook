
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Calendar, User, Tag, Share2, Heart, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, isLoading } = useApp();
  
  const post = id ? getPost(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
               <div className="flex gap-4">
                 <button className="text-gray-400 hover:text-red-500 transition-colors"><Heart size={20} /></button>
                 <button className="text-gray-400 hover:text-brand-600 transition-colors"><Share2 size={20} /></button>
               </div>
             </div>

             {/* Markdown Content */}
             <article className="prose prose-lg prose-brand prose-headings:font-serif prose-headings:font-bold text-gray-900 leading-relaxed prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900 prose-a:text-brand-600">
               <ReactMarkdown>{post.content}</ReactMarkdown>
             </article>

             {/* Author Footer */}
             <div className="mt-16 pt-8 border-t border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xl">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Written by {post.author}</p>
                  <p className="text-sm text-gray-500">BookNook Contributor</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default PostDetails;
