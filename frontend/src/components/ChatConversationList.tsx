/**
 * Chat Conversation List Component
 * 
 * Sidebar showing all conversations with last message preview
 */

import React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useApp } from '../context/AppContext';

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

interface ChatConversationListProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const ChatConversationList: React.FC<ChatConversationListProps> = ({
    searchQuery,
    onSearchChange,
}) => {
    const { user } = useApp();
    const { conversations, activeConversationId, selectConversation, isLoading } = useChat();

    // Filter conversations by search query
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery.trim()) return true;

        // Search in participant nicknames
        const participantMatch = conv.participants.some((p) =>
            p.userNickname?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Search in conversation name (for groups)
        const nameMatch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase());

        // Search in last message content
        const messageMatch = conv.lastMessage?.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return participantMatch || nameMatch || messageMatch;
    });

    // Get display name for a conversation
    const getConversationName = (conv: typeof conversations[0]) => {
        if (conv.isGroup && conv.name) {
            return conv.name;
        }

        // For DMs, show the other participant's name
        const otherParticipant = conv.participants.find((p) => p.odId !== user?.id);
        return otherParticipant?.userNickname || 'Unknown User';
    };

    // Get avatar for a conversation
    const getConversationAvatar = (conv: typeof conversations[0]) => {
        if (conv.isGroup) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || 'Group')}&background=random`;
        }

        const otherParticipant = conv.participants.find((p) => p.odId !== user?.id);
        return otherParticipant?.userAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(getConversationName(conv))}&background=random`;
    };

    return (
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Loading conversations...
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        {searchQuery ? 'No conversations match your search.' : 'No conversations yet. Start chatting!'}
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isActive = activeConversationId === conv.id;
                        const displayName = getConversationName(conv);
                        const avatarUrl = getConversationAvatar(conv);
                        const lastMsg = conv.lastMessage;
                        const isUnread = conv.unreadCount > 0;

                        return (
                            <button
                                key={conv.id}
                                onClick={() => selectConversation(conv.id)}
                                className={`w-full flex items-center p-4 hover:bg-white transition-colors border-b border-gray-100 ${isActive
                                        ? 'bg-white border-l-4 border-l-brand-600'
                                        : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {isUnread && (
                                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">
                                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`font-bold text-sm truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {displayName}
                                        </span>
                                        {lastMsg && (
                                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                {timeAgo(lastMsg.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                        {lastMsg
                                            ? lastMsg.senderId === user?.id
                                                ? `You: ${lastMsg.content}`
                                                : lastMsg.content
                                            : 'No messages yet'}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatConversationList;
