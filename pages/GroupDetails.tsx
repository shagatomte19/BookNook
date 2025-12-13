
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Users, Lock, ChevronLeft, Shield, Clock, Send, Check, X as XIcon, UserPlus } from 'lucide-react';
import { GroupPost } from '../types';

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { groups, user, joinGroup, acceptMember, rejectMember, groupPosts, addGroupPost } = useApp();
  const [postContent, setPostContent] = useState('');

  const group = groups.find(g => g.id === id);

  if (!group) return <div className="p-20 text-center">Group not found</div>;

  const isMember = group.members.includes(user.id);
  const isPending = group.pendingMembers.includes(user.id);
  const isAdmin = group.adminId === user.id;

  const currentGroupPosts = groupPosts.filter(p => p.groupId === group.id);

  const handleJoin = () => {
    joinGroup(group.id);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: GroupPost = {
      id: `gp${Date.now()}`,
      groupId: group.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: postContent,
      date: 'Just now',
      likes: 0
    };

    addGroupPost(newPost);
    setPostContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-64 bg-gray-900">
        <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
           <div className="max-w-7xl mx-auto">
             <Link to="/groups" className="text-white/80 hover:text-white mb-4 inline-flex items-center text-sm">
                <ChevronLeft size={16} className="mr-1" /> Back to Groups
             </Link>
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                   <h1 className="text-4xl font-serif font-bold text-white mb-2">{group.name}</h1>
                   <p className="text-gray-300 max-w-2xl">{group.description}</p>
                   <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                      <span className="flex items-center"><Users size={16} className="mr-1.5" /> {group.members.length} Members</span>
                      <span className="flex items-center"><Shield size={16} className="mr-1.5" /> Admin: {group.adminId === user.id ? 'You' : 'Moderated'}</span>
                   </div>
                </div>
                
                <div>
                  {!isMember && !isPending && (
                    <button 
                      onClick={handleJoin}
                      className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg transition-transform transform hover:-translate-y-0.5 flex items-center"
                    >
                      <UserPlus size={20} className="mr-2" /> Join Group
                    </button>
                  )}
                  {isPending && (
                    <button disabled className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium cursor-not-allowed flex items-center">
                      <Clock size={20} className="mr-2" /> Pending Approval
                    </button>
                  )}
                  {isMember && (
                     <div className="px-6 py-3 bg-green-600/20 text-green-400 border border-green-600/30 rounded-xl font-medium flex items-center backdrop-blur-sm">
                       <Check size={20} className="mr-2" /> Member
                     </div>
                  )}
                </div>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content: Discussion */}
         <div className="lg:col-span-2 space-y-6">
            {isMember ? (
               <>
                  {/* Post Input */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex gap-4">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full" alt="You" />
                        <form onSubmit={handlePostSubmit} className="flex-1">
                           <textarea 
                             className="w-full bg-gray-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none mb-3"
                             rows={3}
                             placeholder="Start a discussion..."
                             value={postContent}
                             onChange={e => setPostContent(e.target.value)}
                           />
                           <div className="flex justify-end">
                              <button 
                                type="submit" 
                                disabled={!postContent.trim()}
                                className="px-5 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium disabled:opacity-50 transition-colors flex items-center"
                              >
                                 <Send size={16} className="mr-2" /> Post
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>

                  {/* Feed */}
                  <div className="space-y-4">
                     {currentGroupPosts.map((post) => (
                        <div 
                          key={post.id}
                          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in"
                        >
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full" />
                                 <div>
                                    <h4 className="font-bold text-gray-900">{post.userName}</h4>
                                    <p className="text-xs text-gray-500">{post.date}</p>
                                 </div>
                              </div>
                           </div>
                           <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </div>
                     ))}
                     {currentGroupPosts.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                           No discussions yet. Be the first to post!
                        </div>
                     )}
                  </div>
               </>
            ) : (
               <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Members Only Content</h3>
                  <p className="text-gray-500 mb-6">Join this group to participate in discussions and view member posts.</p>
                  {!isPending && (
                     <button onClick={handleJoin} className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
                        Request to Join
                     </button>
                  )}
               </div>
            )}
         </div>

         {/* Sidebar: Admin & Info */}
         <div className="space-y-6">
            {/* Admin Panel */}
            {isAdmin && (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                     <Shield size={18} className="text-brand-600 mr-2" /> Admin Panel
                  </h3>
                  
                  {group.pendingMembers.length > 0 ? (
                     <div className="space-y-4">
                        <p className="text-sm text-gray-500 font-medium">Pending Requests ({group.pendingMembers.length})</p>
                        {group.pendingMembers.map(pendingId => (
                           <div key={pendingId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                    U{pendingId.slice(1)}
                                 </div>
                                 <span className="text-sm font-medium">User {pendingId}</span>
                              </div>
                              <div className="flex gap-1">
                                 <button 
                                   onClick={() => acceptMember(group.id, pendingId)}
                                   className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                                 >
                                    <Check size={16} />
                                 </button>
                                 <button 
                                   onClick={() => rejectMember(group.id, pendingId)}
                                   className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                 >
                                    <XIcon size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm text-gray-500 italic">No pending requests.</p>
                  )}
               </div>
            )}

            {/* About Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">About this Group</h3>
               <p className="text-sm text-gray-600 mb-4">{group.description}</p>
               <div className="flex flex-wrap gap-2">
                  {group.tags.map(tag => (
                     <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GroupDetails;
