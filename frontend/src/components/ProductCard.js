import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

const ProductCard = ({ product, delay = 0, onAddToCart }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);


  // Simple price formatting for known backend format
  const formatPrice = (product) => {
    if (product.price_usd) {
      return (product.price_usd.units + (product.price_usd.nanos || 0) / 1000000000).toFixed(2);
    }
    return '0.00';
  };

  // Get the display price
  const displayPrice = formatPrice(product);
  
  // Simple image extraction for known backend format
  const getProductImage = (product) => {
    return product.picture || null;
  };
  
  const productImage = getProductImage(product);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (isAdding || !onAddToCart) return;
    
    setIsAdding(true);
    try {
      // Trigger AI to add item to cart silently (no user message shown)
      await onAddToCart(`Add 1 ${product.name} (product ID: ${product.id}) to cart for arjun`, true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 max-w-sm mx-auto md:max-w-none"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-gray-100 max-h-48">
        {productImage && !imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}
        
        {!productImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        {productImage && (
          <motion.img
            src={productImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
          >
            <EyeIcon className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Sale Badge */}
        {product.onSale && (
          <div className="absolute top-3 left-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
            >
              SALE
            </motion.div>
          </div>
        )}

        {/* Like Button - Mobile */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsLiked(!isLiked)}
          className="md:hidden absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
        >
          {isLiked ? (
            <HeartSolidIcon className="w-4 h-4 text-red-500" />
          ) : (
            <HeartIcon className="w-4 h-4 text-gray-700" />
          )}
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5">
        {/* Brand & Category */}
        {product.brand && (
          <p className="text-xs md:text-sm text-boutique-600 font-medium mb-1">
            {product.brand}
          </p>
        )}
        
        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <p className="text-xs md:text-sm text-boutique-600 font-medium mb-1">
            {product.categories.join(', ')}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-2">
          {product.name || 'Product'}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg md:text-xl font-bold text-gray-900">
              ${displayPrice}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isAdding ? 1 : 1.05 }}
            whileTap={{ scale: isAdding ? 1 : 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`${
              isAdding 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-boutique-500 to-primary-500 hover:shadow-xl'
            } text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm shadow-lg transition-all duration-200 flex items-center space-x-1`}
          >
            <ShoppingCartIcon className={`w-4 h-4 ${isAdding ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </span>
            <span className="sm:hidden">
              {isAdding ? '...' : 'Add'}
            </span>
          </motion.button>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        
          <span>
            {product.id ? `ID: ${product.id}` : 'In stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
