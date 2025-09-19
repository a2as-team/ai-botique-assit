import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const dotTransition = {
    duration: 0.5,
    repeatType: "reverse",
    repeat: Infinity,
    ease: "easeInOut"
  };

  return (
    <div className="mb-6 flex justify-start">
      <div className="flex max-w-[85%] md:max-w-[75%]">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-boutique-500 to-primary-500 text-white mr-3 flex items-center justify-center"
        >
          <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
        </motion.div>

        {/* Typing Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 md:px-5 md:py-4 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"
        >
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 mr-2">AI is typing</span>
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-boutique-400 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-boutique-400 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0.1 }}
              />
              <motion.div
                className="w-2 h-2 bg-boutique-400 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TypingIndicator;
