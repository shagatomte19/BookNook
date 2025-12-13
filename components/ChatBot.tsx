
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Minimize2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Chat } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: "Hi! I'm BookBot. Need a book recommendation or help navigating BookNook?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to persist the chat session across renders
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    const session = createChatSession();
    if (session) {
      chatSessionRef.current = session;
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      const responseText = result.text || "I'm having a little trouble reading the pages right now. Please try again.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the library archives (API). Please check your connection."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isOpen && (
          <div
            className="mb-4 w-[90vw] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden animate-fade-in"
          >
            {/* Header */}
            <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                  <Sparkles size={18} className="text-brand-100" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">BookBot AI</h3>
                  <p className="text-xs text-brand-200">Always here to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white ${msg.role === 'user' ? 'bg-gray-800' : 'bg-brand-500'}`}>
                       {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-gray-900 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border border-brand-100 rounded-bl-none'
                      }`}
                    >
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm max-w-none prose-brand dark:prose-invert">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                   <div className="flex items-end gap-2">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-500 text-white">
                         <Bot size={12} />
                      </div>
                      <div className="bg-white border border-brand-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm transition-all"
                  placeholder="Ask about books..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={!chatSessionRef.current || isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || !chatSessionRef.current || isLoading}
                  className="absolute right-2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              {!chatSessionRef.current && (
                <p className="text-xs text-red-500 mt-2 text-center">API Key missing. Chat disabled.</p>
              )}
            </form>
          </div>
        )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg shadow-brand-600/30 flex items-center justify-center hover:bg-brand-700 transition-colors transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatBot;
