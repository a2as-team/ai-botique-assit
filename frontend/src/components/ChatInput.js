import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };


  return (
    <div className="border-t border-gray-200 bg-white">

      {/* Input Area */}
      <div className="px-4 py-3 md:px-6 md:py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Additional Actions - Desktop */}
          <div className="hidden md:flex space-x-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-boutique-600 transition-colors rounded-lg hover:bg-gray-50"
              disabled={disabled}
            >
              <PhotoIcon className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-boutique-600 transition-colors rounded-lg hover:bg-gray-50"
              disabled={disabled}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about our products..."
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 md:px-5 md:py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-boutique-500 focus:border-transparent resize-none text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 placeholder:text-gray-500"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                height: Math.min(48 + (message.split('\n').length - 1) * 20, 120)
              }}
            />
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            disabled={disabled || !message.trim()}
            className={`p-3 md:p-3.5 rounded-full shadow-lg transition-all duration-200 ${
              disabled || !message.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-boutique-500 to-primary-500 hover:shadow-xl'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.button>
        </form>

        {/* Character Count - Mobile */}
        {message.length > 100 && (
          <div className="mt-2 text-xs text-gray-500 text-right md:hidden">
            {message.length}/500
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatInput;
