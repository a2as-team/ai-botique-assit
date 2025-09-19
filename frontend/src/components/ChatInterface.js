import React, { useState, useLayoutEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { createSession, sendMessage } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Robust auto-scroll implementation
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container && !showWelcome) {
      // Direct container scrolling - more reliable
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      
      // Backup: scroll to anchor element
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, isLoading, showWelcome]);

  const initializeChat = async () => {
    try {
      const session = await createSession();
      setSessionId(session.sessionId);
      setShowWelcome(false);
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: "Hello! I'm your BoutiqueAI Assistant. I can help you discover amazing products, check your cart, find the perfect gifts, and answer any questions about our boutique collection. What can I help you with today?",
        timestamp: new Date(),
        quickReplies: [
          "Show me trending products",
          "Help me find sunglasses",
          "What's in my cart?",
          "Find a gift under $50"
        ]
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleSendMessage = async (messageText, silent = false) => {
    if (!messageText.trim() || isLoading) return;

    // Add user message only if not silent
    if (!silent) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    try {
      const response = await sendMessage(messageText, sessionId);
      
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        data: response.data || null  // Include structured data for product rendering
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setShowWelcome(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Layout */}
      <div className="flex flex-col h-full w-full md:hidden bg-white">
        <ChatHeader onNewSession={handleNewSession} />
        
        <div ref={scrollContainerRef} className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <WelcomeScreen 
                key="welcome"
                onStartChat={initializeChat} 
              />
            ) : (
                <MessageList
                  key="messages"
                  messages={messages}
                  isLoading={isLoading}
                  onQuickReply={handleQuickReply}
                />
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
        
        {!showWelcome && (
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full w-full bg-white overflow-hidden">
        <ChatHeader onNewSession={handleNewSession} />
        
        <div className="flex-1 flex min-h-0">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
              <AnimatePresence mode="wait">
                {showWelcome ? (
                  <WelcomeScreen 
                    key="welcome"
                    onStartChat={initializeChat} 
                  />
                ) : (
                  <MessageList
                    key="messages"
                    messages={messages}
                    isLoading={isLoading}
                    onQuickReply={handleQuickReply}
                    onSendMessage={handleSendMessage}
                  />
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
            
            {!showWelcome && (
              <ChatInput 
                onSendMessage={handleSendMessage}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
