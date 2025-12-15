
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import { Send, User as UserIcon, Search, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // You might need to add date-fns to imports or write a helper
// Since I can't add packages, I will write a simple helper function

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Messages: React.FC = () => {
  const { user, messages, allUsers, sendMessage, markMessagesRead } = useApp();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId || null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get list of users to display in sidebar
  // Logic: People you follow, people who follow you, or people you have messages with
  const contactIds = new Set<string>();
  
  if (user) {
    user.following.forEach(id => contactIds.add(id));
    user.followers.forEach(id => contactIds.add(id));
    messages.forEach(m => {
      if (m.senderId === user.id) contactIds.add(m.receiverId);
      if (m.receiverId === user.id) contactIds.add(m.senderId);
    });
  }

  const contacts = Array.from(contactIds)
    .map(id => allUsers.find(u => u.id === id))
    .filter((u): u is typeof u & {} => !!u); // Filter undefined

  // Current conversation
  const activeConversation = selectedUserId 
    ? messages.filter(m => 
        (m.senderId === user?.id && m.receiverId === selectedUserId) ||
        (m.senderId === selectedUserId && m.receiverId === user?.id)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];
    
  const selectedUser = allUsers.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (selectedUserId) {
      markMessagesRead(selectedUserId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUserId, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUserId) return;
    sendMessage(selectedUserId, inputValue);
    setInputValue('');
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search conversations..."
               className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
             const lastMsg = messages
               .filter(m => (m.senderId === contact.id && m.receiverId === user.id) || (m.receiverId === contact.id && m.senderId === user.id))
               .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
             
             const isUnread = lastMsg && lastMsg.receiverId === user.id && !lastMsg.read;

             return (
               <button
                 key={contact.id}
                 onClick={() => setSelectedUserId(contact.id)}
                 className={`w-full flex items-center p-4 hover:bg-white transition-colors border-b border-gray-100 ${selectedUserId === contact.id ? 'bg-white border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'}`}
               >
                 <div className="relative">
                   <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                   {isUnread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                 </div>
                 <div className="ml-3 flex-1 text-left">
                    <div className="flex justify-between items-baseline mb-1">
                       <span className={`font-bold text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{contact.name}</span>
                       {lastMsg && <span className="text-xs text-gray-400">{timeAgo(lastMsg.timestamp)}</span>}
                    </div>
                    <p className={`text-xs truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {lastMsg ? (lastMsg.senderId === user.id ? `You: ${lastMsg.content}` : lastMsg.content) : 'Start a conversation'}
                    </p>
                 </div>
               </button>
             );
          })}
          {contacts.length === 0 && (
             <div className="p-8 text-center text-gray-500 text-sm">
               Follow users to start messaging them.
             </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col h-full">
           {/* Header */}
           <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center space-x-3">
                 <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                 <div>
                    <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                    <span className="text-xs text-green-500 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Online</span>
                 </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                 <MoreVertical size={20} />
              </button>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 scroll-smooth custom-scrollbar">
              {activeConversation.map(msg => {
                 const isMe = msg.senderId === user.id;
                 return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                         isMe 
                           ? 'bg-brand-600 text-white rounded-br-none' 
                           : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                         <p className="text-sm">{msg.content}</p>
                         <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>
                 );
              })}
              <div ref={messagesEndRef} />
           </div>

           {/* Input */}
           <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={e => setInputValue(e.target.value)}
                   placeholder={`Message ${selectedUser.name}...`}
                   className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                 />
                 <button 
                   type="submit" 
                   disabled={!inputValue.trim()}
                   className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                    <Send size={20} />
                 </button>
              </div>
           </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-8">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Send size={40} />
           </div>
           <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Your Messages</h2>
           <p className="text-gray-500 max-w-md">Select a conversation from the sidebar or find a user to start chatting with.</p>
        </div>
      )}
    </div>
  );
};

export default Messages;
