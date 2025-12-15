/**
 * Typing Indicator Component
 * 
 * Shows animated typing indicator with user nicknames
 */

import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../types';

interface TypingIndicatorProps {
    typingUsers: TypingIndicatorType[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
    if (typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].userNickname} is typing`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].userNickname} and ${typingUsers[1].userNickname} are typing`;
        } else {
            return `${typingUsers.length} people are typing`;
        }
    };

    return (
        <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
            <div className="flex space-x-1">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="italic">{getTypingText()}</span>
        </div>
    );
};

export default TypingIndicator;
