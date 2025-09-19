import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  GiftIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const WelcomeScreen = ({ onStartChat }) => {
  const quickActions = [
    {
      icon: MagnifyingGlassIcon,
      title: "Discover Products",
      description: "Browse our latest collection",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: GiftIcon,
      title: "Find Gifts",
      description: "Perfect presents for loved ones",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: HeartIcon,
      title: "Wishlist",
      description: "Save your favorite items",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: ShoppingBagIcon,
      title: "My Cart",
      description: "Review your selections",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center p-6 md:p-12"
    >
      <div className="text-center max-w-md mx-auto">
        {/* Hero Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-boutique-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Welcome to BoutiqueAI Assistant
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            Your personal shopping assistant is here to help you discover amazing products, 
            manage your cart, and find the perfect items for any occasion.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3 md:gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={onStartChat}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                <action.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                {action.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {action.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartChat}
          className="w-full bg-gradient-to-r from-boutique-500 to-primary-500 text-white font-semibold py-3 md:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Start Shopping with AI
        </motion.button>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-xs md:text-sm text-gray-500"
        >
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>24/7 Available</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>Personalized</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span>Smart Recommendations</span>
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;