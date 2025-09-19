import React from 'react';
import { motion } from 'framer-motion';

const QuickReplies = ({ replies, onReply, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="mt-3 flex flex-wrap gap-2"
    >
      {replies.map((reply, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReply(reply)}
          className="px-3 py-2 text-sm bg-gradient-to-r from-boutique-500 to-primary-500 text-white rounded-full hover:shadow-lg transition-all duration-200 border border-boutique-300"
        >
          {reply}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickReplies;
