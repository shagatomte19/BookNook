/**
 * Chat Message Area Component
 * 
 * Main chat area with messages, input, and typing indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useApp } from '../context/AppContext';
import TypingIndicator from './TypingIndicator';

interface ChatMessageAreaProps {
    onBack?: () => void;
    showBackButton?: boolean;
}

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({ onBack, showBackButton = false }) => {
    const { user } = useApp();
    const {
        conversations,
        activeConversationId,
        messages,
        typingUsers,
        sendMessage,
        setTyping,
        isLoading,
    } = useChat();

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get active conversation details
    const activeConversation = conversations.find((c) => c.id === activeConversationId);

    // Get conversation display name and avatar
    const getDisplayInfo = () => {
        if (!activeConversation) return { name: '', avatar: '' };

        if (activeConversation.isGroup && activeConversation.name) {
            return {
                name: activeConversation.name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.name)}&background=random`,
            };
        }

        const otherParticipant = activeConversation.participants.find((p) => p.odId !== user?.id);
        const name = otherParticipant?.userNickname || 'Unknown User';
        return {
            name,
            avatar: otherParticipant?.userAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        };
    };

    const { name: displayName, avatar: displayAvatar } = getDisplayInfo();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when conversation changes
    useEffect(() => {
        if (activeConversationId) {
            inputRef.current?.focus();
        }
    }, [activeConversationId]);

    // Handle input change with typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.trim()) {
            setTyping(true);
        } else {
            setTyping(false);
        }
    };

    // Handle send message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const messageContent = inputValue.trim();
        setInputValue('');
        setTyping(false);

        await sendMessage(messageContent);
    };

    // Format time
    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // No active conversation
    if (!activeConversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                    <Send size={40} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Your Messages</h2>
                <p className="text-gray-500 max-w-md">
                    Select a conversation from the sidebar or find a user to start chatting with.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center space-x-3">
                    {showBackButton && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900">{displayName}</h3>
                        {activeConversation?.isGroup && (
                            <span className="text-xs text-gray-500">
                                {activeConversation.participants.length} members
                            </span>
                        )}
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 scroll-smooth">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                                {!isMe && (
                                    <img
                                        src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderNickname)}&background=random`}
                                        alt={msg.senderNickname}
                                        className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 self-end"
                                    />
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${isMe
                                            ? 'bg-brand-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {!isMe && activeConversation?.isGroup && (
                                        <p className="text-xs font-semibold text-brand-600 mb-1">
                                            {msg.senderNickname}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    <p
                                        className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-gray-400'
                                            }`}
                                    >
                                        {formatTime(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            <TypingIndicator typingUsers={typingUsers} />

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={`Message ${displayName}...`}
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
    );
};

export default ChatMessageArea;
