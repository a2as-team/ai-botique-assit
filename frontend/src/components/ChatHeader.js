import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ChatHeader = ({ onNewSession }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-boutique-600 to-primary-600 text-white"
    >
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">BoutiqueAI Assistant</h1>
              <p className="text-xs md:text-sm text-white/80 hidden sm:block">Your Personal Shopping Assistant</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewSession}
              className="p-2 md:p-2.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="New Chat"
            >
              <ArrowPathIcon className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
            
            {/* Online Status */}
            <div className="hidden md:flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Mobile Status Indicator */}
        <div className="md:hidden mt-2 flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-white/80">AI Assistant is online</span>
        </div>
      </div>
    </motion.header>
  );
};

export default ChatHeader;
