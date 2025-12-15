/**
 * Messages Page - Real-time chat with Supabase
 * 
 * Integrates ChatConversationList and ChatMessageArea components
 * with real-time messaging through ChatContext.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useChat } from '../context/ChatContext';
import ChatConversationList from '../components/ChatConversationList';
import ChatMessageArea from '../components/ChatMessageArea';

const Messages: React.FC = () => {
  const { user, allUsers } = useApp();
  const { startConversation, selectConversation, activeConversationId, clearActiveConversation } = useChat();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Handle userId query param for starting a new conversation
  const initialUserId = searchParams.get('userId');

  useEffect(() => {
    const initConversation = async () => {
      if (initialUserId && user) {
        const otherUser = allUsers.find((u) => u.id === initialUserId);
        if (otherUser) {
          const conversationId = await startConversation(
            otherUser.id,
            otherUser.nickname || otherUser.name,
            otherUser.avatarUrl
          );
          if (conversationId) {
            await selectConversation(conversationId);
            setShowMobileChat(true);
            // Clear the query param
            navigate('/messages', { replace: true });
          }
        }
      }
    };

    initConversation();
  }, [initialUserId, user, allUsers, startConversation, selectConversation, navigate]);

  // Handle conversation selection for mobile
  const handleConversationSelect = async (conversationId: string) => {
    await selectConversation(conversationId);
    setShowMobileChat(true);
  };

  // Handle back button on mobile
  const handleBack = () => {
    clearActiveConversation();
    setShowMobileChat(false);
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      {/* Conversation List - hidden on mobile when chat is open */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
        <ChatConversationList
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Chat Area - hidden on mobile when conversation list is shown */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatMessageArea
          onBack={handleBack}
          showBackButton={showMobileChat}
        />
      </div>
    </div>
  );
};

export default Messages;
