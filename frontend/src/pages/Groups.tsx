
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, Plus, X, Search, Lock } from 'lucide-react';
import { Group } from '../types';

const Groups: React.FC = () => {
  const { groups, createGroup, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTags, setGroupTags] = useState('');
  const [groupImage, setGroupImage] = useState('');

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: groupName,
      description: groupDesc,
      adminId: user.id,
      members: [user.id],
      pendingMembers: [],
      imageUrl: groupImage || 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
      tags: groupTags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    createGroup(newGroup);
    setIsModalOpen(false);
    // Reset
    setGroupName('');
    setGroupDesc('');
    setGroupTags('');
    setGroupImage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-8 px-4">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Book Clubs & Groups</h1>
               <p className="text-gray-500">Connect with fellow readers, join discussions, and share your passion.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-5 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" /> Create Group
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
         {/* Search */}
         <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for groups by name or topic..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGroups.map((group) => (
               <div 
                 key={group.id}
                 className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full animate-fade-in"
               >
                 <div className="h-40 relative">
                    <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                       <h3 className="text-white font-bold text-xl font-serif truncate">{group.name}</h3>
                    </div>
                 </div>
                 
                 <div className="p-6 flex-1 flex flex-col">
                    <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                       {group.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                       ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                       <div className="flex items-center text-gray-500 text-sm">
                          <Users size={16} className="mr-1.5" />
                          <span>{group.members.length} members</span>
                       </div>
                       <Link 
                         to={`/group/${group.id}`}
                         className="text-brand-600 font-medium text-sm hover:underline"
                       >
                         Visit Group
                       </Link>
                    </div>
                 </div>
               </div>
            ))}
         </div>
         
         {filteredGroups.length === 0 && (
            <div className="text-center py-20 text-gray-500">
               No groups found matching your search. Why not create one?
            </div>
         )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <div 
               className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in"
            >
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-900">Create New Group</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                     <input 
                       type="text" 
                       required
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                       value={groupName}
                       onChange={e => setGroupName(e.target.value)}
                     />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                     <textarea 
                       required
                       rows={3}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                       value={groupDesc}
                       onChange={e => setGroupDesc(e.target.value)}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                     <input 
                       type="url" 
                       placeholder="https://..."
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                       value={groupImage}
                       onChange={e => setGroupImage(e.target.value)}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                     <input 
                       type="text" 
                       placeholder="Fantasy, Romance, Local..."
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                       value={groupTags}
                       onChange={e => setGroupTags(e.target.value)}
                     />
                  </div>

                  <div className="pt-4 flex justify-end">
                     <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">
                        Create Group
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default Groups;
