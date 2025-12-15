/**
 * Chat Context - Real-time messaging state management
 * 
 * Provides chat state and functions for Supabase real-time messaging.
 * Separate from AppContext to keep concerns isolated.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Conversation, ChatMessage, TypingIndicator, ConversationParticipant, User } from '../types';
import { useApp } from './AppContext';
import * as chatService from '../services/supabaseChat';

interface ConversationWithDetails extends Conversation {
    participants: ConversationParticipant[];
    lastMessage?: ChatMessage;
    unreadCount: number;
}

interface ChatContextType {
    // State
    conversations: ConversationWithDetails[];
    activeConversationId: string | null;
    messages: ChatMessage[];
    typingUsers: TypingIndicator[];
    isLoading: boolean;

    // Actions
    loadConversations: () => Promise<void>;
    selectConversation: (conversationId: string) => Promise<void>;
    startConversation: (otherUserId: string, otherUserNickname: string, otherUserAvatar: string | null) => Promise<string | null>;
    sendMessage: (content: string) => Promise<void>;
    setTyping: (isTyping: boolean) => void;
    clearActiveConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useApp();

    // State
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Refs for subscriptions
    const messageChannelRef = useRef<RealtimeChannel | null>(null);
    const typingChannelRef = useRef<RealtimeChannel | null>(null);
    const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load all conversations for the current user
    const loadConversations = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const convs = await chatService.getConversations(user.id);

            // Fetch additional details for each conversation
            const conversationsWithDetails: ConversationWithDetails[] = await Promise.all(
                convs.map(async (conv) => {
                    const participants = await chatService.getConversationParticipants(conv.id);
                    const lastMessages = await chatService.getLastMessages([conv.id]);
                    const unreadCount = await chatService.getUnreadCount(conv.id, user.id);

                    return {
                        ...conv,
                        participants,
                        lastMessage: lastMessages.get(conv.id),
                        unreadCount,
                    };
                })
            );

            setConversations(conversationsWithDetails);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Select and load a conversation
    const selectConversation = useCallback(async (conversationId: string) => {
        if (!user) return;

        // Unsubscribe from previous conversation
        if (messageChannelRef.current) {
            chatService.unsubscribe(messageChannelRef.current);
        }
        if (typingChannelRef.current) {
            chatService.unsubscribe(typingChannelRef.current);
        }

        setActiveConversationId(conversationId);
        setMessages([]);
        setTypingUsers([]);
        setIsLoading(true);

        try {
            // Load messages
            const msgs = await chatService.getMessages(conversationId);
            setMessages(msgs);

            // Mark as read
            await chatService.markConversationRead(conversationId, user.id);

            // Update unread count in conversations list
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                )
            );

            // Subscribe to new messages
            messageChannelRef.current = chatService.subscribeToMessages(
                conversationId,
                (newMessage) => {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });

                    // Mark as read if we're viewing this conversation
                    if (newMessage.senderId !== user.id) {
                        chatService.markConversationRead(conversationId, user.id);
                    }
                }
            );

            // Subscribe to typing indicators
            typingChannelRef.current = chatService.subscribeToTyping(
                conversationId,
                (indicators) => {
                    // Filter out current user's typing indicator
                    setTypingUsers(indicators.filter(i => i.userId !== user.id));
                }
            );

            // Load initial typing indicators
            const indicators = await chatService.getTypingIndicators(conversationId);
            setTypingUsers(indicators.filter(i => i.userId !== user.id));

        } catch (error) {
            console.error('Error loading conversation:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Start a new DM conversation
    const startConversation = useCallback(async (
        otherUserId: string,
        otherUserNickname: string,
        otherUserAvatar: string | null
    ): Promise<string | null> => {
        if (!user) return null;

        const userNickname = user.nickname || user.name;
        const userAvatar = user.avatarUrl;

        const conversation = await chatService.getOrCreateDMConversation(
            user.id,
            userNickname,
            userAvatar,
            otherUserId,
            otherUserNickname,
            otherUserAvatar
        );

        if (conversation) {
            await loadConversations();
            return conversation.id;
        }

        return null;
    }, [user, loadConversations]);

    // Send a message in the active conversation
    const sendMessage = useCallback(async (content: string) => {
        if (!user || !activeConversationId || !content.trim()) return;

        const userNickname = user.nickname || user.name;
        const userAvatar = user.avatarUrl;

        // Clear typing indicator when sending
        await chatService.clearTypingIndicator(activeConversationId, user.id);

        const message = await chatService.sendMessage(
            activeConversationId,
            user.id,
            userNickname,
            userAvatar,
            content.trim()
        );

        if (message) {
            // Update last message in conversations list
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === activeConversationId
                        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
                        : conv
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            );
        }
    }, [user, activeConversationId]);

    // Set typing indicator
    const setTyping = useCallback((isTyping: boolean) => {
        if (!user || !activeConversationId) return;

        const userNickname = user.nickname || user.name;

        if (isTyping) {
            chatService.setTypingIndicator(activeConversationId, user.id, userNickname);

            // Auto-clear after 3 seconds of no typing
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                chatService.clearTypingIndicator(activeConversationId, user.id);
            }, 3000);
        } else {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            chatService.clearTypingIndicator(activeConversationId, user.id);
        }
    }, [user, activeConversationId]);

    // Clear active conversation
    const clearActiveConversation = useCallback(() => {
        if (messageChannelRef.current) {
            chatService.unsubscribe(messageChannelRef.current);
            messageChannelRef.current = null;
        }
        if (typingChannelRef.current) {
            chatService.unsubscribe(typingChannelRef.current);
            typingChannelRef.current = null;
        }
        setActiveConversationId(null);
        setMessages([]);
        setTypingUsers([]);
    }, []);

    // Subscribe to conversation updates when user changes
    useEffect(() => {
        if (!user) {
            setConversations([]);
            clearActiveConversation();
            return;
        }

        loadConversations();

        // Subscribe to conversation updates
        conversationsChannelRef.current = chatService.subscribeToConversations(
            user.id,
            () => {
                loadConversations();
            }
        );

        return () => {
            if (conversationsChannelRef.current) {
                chatService.unsubscribe(conversationsChannelRef.current);
            }
        };
    }, [user, loadConversations, clearActiveConversation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (messageChannelRef.current) {
                chatService.unsubscribe(messageChannelRef.current);
            }
            if (typingChannelRef.current) {
                chatService.unsubscribe(typingChannelRef.current);
            }
            if (conversationsChannelRef.current) {
                chatService.unsubscribe(conversationsChannelRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <ChatContext.Provider
            value={{
                conversations,
                activeConversationId,
                messages,
                typingUsers,
                isLoading,
                loadConversations,
                selectConversation,
                startConversation,
                sendMessage,
                setTyping,
                clearActiveConversation,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
