/**
 * Supabase Chat Service - Real-time messaging operations
 * 
 * This service handles all chat-related operations using Supabase:
 * - Conversations (DMs and group chats)
 * - Real-time messaging
 * - Typing indicators
 * - Participant management
 */

import { supabase } from './supabase';
import { Conversation, ConversationParticipant, ChatMessage, TypingIndicator } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// Types for Supabase responses
// ============================================

interface ConversationRow {
    id: string;
    name: string | null;
    is_group: boolean;
    created_at: string;
    updated_at: string;
}

interface ParticipantRow {
    conversation_id: string;
    user_id: string;
    user_nickname: string | null;
    user_avatar: string | null;
    joined_at: string;
    last_read_at: string;
}

interface MessageRow {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_nickname: string;
    sender_avatar: string | null;
    content: string;
    created_at: string;
}

interface TypingRow {
    conversation_id: string;
    user_id: string;
    user_nickname: string;
    updated_at: string;
}

// ============================================
// Conversation Operations
// ============================================

/**
 * Get all conversations for the current user
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
    // First get conversation IDs where user is a participant
    const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

    if (participantError) {
        console.error('Error fetching participant data:', participantError);
        return [];
    }

    if (!participantData || participantData.length === 0) {
        return [];
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    // Fetch the conversations
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }

    return (data as ConversationRow[]).map(row => ({
        id: row.id,
        name: row.name,
        isGroup: row.is_group,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
};

/**
 * Get or create a DM conversation between two users
 */
export const getOrCreateDMConversation = async (
    currentUserId: string,
    currentUserNickname: string,
    currentUserAvatar: string | null,
    otherUserId: string,
    otherUserNickname: string,
    otherUserAvatar: string | null
): Promise<Conversation | null> => {
    // Find existing DM conversation between these users
    const { data: myConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

    if (myConversations && myConversations.length > 0) {
        const myConvIds = myConversations.map(c => c.conversation_id);

        // Check if other user is in any of these conversations (and it's a DM)
        const { data: sharedConversation } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
            .in('conversation_id', myConvIds);

        if (sharedConversation && sharedConversation.length > 0) {
            // Check if it's a DM (not a group)
            for (const conv of sharedConversation) {
                const { data: convData } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('id', conv.conversation_id)
                    .eq('is_group', false)
                    .single();

                if (convData) {
                    return {
                        id: convData.id,
                        name: convData.name,
                        isGroup: convData.is_group,
                        createdAt: convData.created_at,
                        updatedAt: convData.updated_at,
                    };
                }
            }
        }
    }

    // Create new DM conversation
    const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
            is_group: false,
            name: null,
        })
        .select()
        .single();

    if (convError || !newConversation) {
        console.error('Error creating conversation:', convError);
        return null;
    }

    // Add both participants
    const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
            {
                conversation_id: newConversation.id,
                user_id: currentUserId,
                user_nickname: currentUserNickname,
                user_avatar: currentUserAvatar,
            },
            {
                conversation_id: newConversation.id,
                user_id: otherUserId,
                user_nickname: otherUserNickname,
                user_avatar: otherUserAvatar,
            },
        ]);

    if (participantsError) {
        console.error('Error adding participants:', participantsError);
        return null;
    }

    return {
        id: newConversation.id,
        name: newConversation.name,
        isGroup: newConversation.is_group,
        createdAt: newConversation.created_at,
        updatedAt: newConversation.updated_at,
    };
};

/**
 * Get participants of a conversation
 */
export const getConversationParticipants = async (conversationId: string): Promise<ConversationParticipant[]> => {
    const { data, error } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId);

    if (error) {
        console.error('Error fetching participants:', error);
        return [];
    }

    return (data as ParticipantRow[]).map(row => ({
        conversationId: row.conversation_id,
        odId: row.user_id,
        userNickname: row.user_nickname,
        userAvatar: row.user_avatar,
        joinedAt: row.joined_at,
        lastReadAt: row.last_read_at,
    }));
};

// ============================================
// Message Operations
// ============================================

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: string, limit = 50): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return (data as MessageRow[]).map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        senderNickname: row.sender_nickname,
        senderAvatar: row.sender_avatar,
        content: row.content,
        createdAt: row.created_at,
    }));
};

/**
 * Send a message
 */
export const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderNickname: string,
    senderAvatar: string | null,
    content: string
): Promise<ChatMessage | null> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            sender_nickname: senderNickname,
            sender_avatar: senderAvatar,
            content: content,
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        return null;
    }

    // Update conversation updated_at timestamp
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    const row = data as MessageRow;
    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        senderNickname: row.sender_nickname,
        senderAvatar: row.sender_avatar,
        content: row.content,
        createdAt: row.created_at,
    };
};

/**
 * Update last read timestamp for a user in a conversation
 */
export const markConversationRead = async (conversationId: string, userId: string): Promise<void> => {
    await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
};

// ============================================
// Typing Indicators
// ============================================

/**
 * Set typing indicator for a user
 */
export const setTypingIndicator = async (
    conversationId: string,
    userId: string,
    userNickname: string
): Promise<void> => {
    await supabase
        .from('typing_indicators')
        .upsert({
            conversation_id: conversationId,
            user_id: userId,
            user_nickname: userNickname,
            updated_at: new Date().toISOString(),
        });
};

/**
 * Clear typing indicator for a user
 */
export const clearTypingIndicator = async (
    conversationId: string,
    userId: string
): Promise<void> => {
    await supabase
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
};

/**
 * Get current typing indicators for a conversation
 */
export const getTypingIndicators = async (conversationId: string): Promise<TypingIndicator[]> => {
    // Only get typing indicators updated in the last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();

    const { data, error } = await supabase
        .from('typing_indicators')
        .select('*')
        .eq('conversation_id', conversationId)
        .gte('updated_at', fiveSecondsAgo);

    if (error) {
        console.error('Error fetching typing indicators:', error);
        return [];
    }

    return (data as TypingRow[]).map(row => ({
        conversationId: row.conversation_id,
        userId: row.user_id,
        userNickname: row.user_nickname,
        updatedAt: row.updated_at,
    }));
};

// ============================================
// Real-time Subscriptions
// ============================================

/**
 * Subscribe to new messages in a conversation
 */
export const subscribeToMessages = (
    conversationId: string,
    onMessage: (message: ChatMessage) => void
): RealtimeChannel => {
    return supabase
        .channel(`messages:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                const row = payload.new as MessageRow;
                onMessage({
                    id: row.id,
                    conversationId: row.conversation_id,
                    senderId: row.sender_id,
                    senderNickname: row.sender_nickname,
                    senderAvatar: row.sender_avatar,
                    content: row.content,
                    createdAt: row.created_at,
                });
            }
        )
        .subscribe();
};

/**
 * Subscribe to typing indicators in a conversation
 */
export const subscribeToTyping = (
    conversationId: string,
    onTypingChange: (indicators: TypingIndicator[]) => void
): RealtimeChannel => {
    const channel = supabase
        .channel(`typing:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'typing_indicators',
                filter: `conversation_id=eq.${conversationId}`,
            },
            async () => {
                // Refetch all typing indicators when any change happens
                const indicators = await getTypingIndicators(conversationId);
                onTypingChange(indicators);
            }
        )
        .subscribe();

    return channel;
};

/**
 * Subscribe to conversation updates (new messages, new participants, etc.)
 */
export const subscribeToConversations = (
    userId: string,
    onConversationUpdate: () => void
): RealtimeChannel => {
    return supabase
        .channel(`user-conversations:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations',
            },
            () => {
                onConversationUpdate();
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'chat_messages',
            },
            () => {
                onConversationUpdate();
            }
        )
        .subscribe();
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribe = (channel: RealtimeChannel): void => {
    supabase.removeChannel(channel);
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get the last message for each conversation
 */
export const getLastMessages = async (conversationIds: string[]): Promise<Map<string, ChatMessage>> => {
    const lastMessages = new Map<string, ChatMessage>();

    for (const conversationId of conversationIds) {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            const row = data as MessageRow;
            lastMessages.set(conversationId, {
                id: row.id,
                conversationId: row.conversation_id,
                senderId: row.sender_id,
                senderNickname: row.sender_nickname,
                senderAvatar: row.sender_avatar,
                content: row.content,
                createdAt: row.created_at,
            });
        }
    }

    return lastMessages;
};

/**
 * Get unread message count for a conversation
 */
export const getUnreadCount = async (conversationId: string, userId: string): Promise<number> => {
    // Get user's last_read_at
    const { data: participant } = await supabase
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single();

    if (!participant) return 0;

    const lastReadAt = participant.last_read_at;

    // Count messages after last_read_at (excluding user's own messages)
    const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .gt('created_at', lastReadAt);

    if (error) {
        console.error('Error counting unread messages:', error);
        return 0;
    }

    return count || 0;
};

export default {
    getConversations,
    getOrCreateDMConversation,
    getConversationParticipants,
    getMessages,
    sendMessage,
    markConversationRead,
    setTypingIndicator,
    clearTypingIndicator,
    getTypingIndicators,
    subscribeToMessages,
    subscribeToTyping,
    subscribeToConversations,
    unsubscribe,
    getLastMessages,
    getUnreadCount,
};
