import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import ProductCard from './ProductCard';
import CartView from './CartView';
import CheckoutForm from './CheckoutForm';
import OrderConfirmation from './OrderConfirmation';
import QuickReplies from './QuickReplies';

const Message = ({ message, onQuickReply, onSendMessage }) => {
  const isBot = message.type === 'bot';
  const scrollContainerRef = useRef(null);
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Extract main products (excluding recommendations)
  const getMainProducts = (data) => {
    if (!data) return [];
    
    let mainProducts = [];
    
    // Direct products
    if (data.products) mainProducts = [...mainProducts, ...data.products];
    
    // List products
    if (data.list_products?.products) mainProducts = [...mainProducts, ...data.list_products.products];
    
    // Search products (handle both single search and array of searches)
    if (data.search_products) {
      if (Array.isArray(data.search_products)) {
        // Multiple searches - collect all products from successful searches
        data.search_products.forEach(search => {
          if (search?.products) mainProducts = [...mainProducts, ...search.products];
        });
      } else if (data.search_products.products) {
        // Single search
        mainProducts = [...mainProducts, ...data.search_products.products];
      }
    }
    
    // Filter products by price
    if (data.filter_products_by_price?.products) mainProducts = [...mainProducts, ...data.filter_products_by_price.products];
    
    // Individual product calls (from get_product)
    if (data.get_product) {
      if (Array.isArray(data.get_product)) {
        mainProducts = [...mainProducts, ...data.get_product];
      } else {
        mainProducts = [...mainProducts, data.get_product];
      }
    }
    
    // Individual product with image calls
    if (data.get_product_with_image) {
      if (Array.isArray(data.get_product_with_image)) {
        mainProducts = [...mainProducts, ...data.get_product_with_image];
      } else {
        mainProducts = [...mainProducts, data.get_product_with_image];
      }
    }
    
    // Remove duplicates by product ID
    const uniqueProducts = mainProducts.filter((product, index, self) => 
      product && product.id && self.findIndex(p => p && p.id === product.id) === index
    );
    
    return uniqueProducts;
  };
  
  // Extract recommended products separately
  const getRecommendedProducts = (data) => {
    if (!data?.list_recommendations?.products) return [];
    
    return data.list_recommendations.products.filter(product => product && product.id);
  };
  
  const products = getMainProducts(message.data);
  const recommendedProducts = getRecommendedProducts(message.data);
  
  // Simple cart data extraction
  const cartData = message.data?.get_cart;
  
  // Extract ads data
  const adsData = message.data?.get_ads;
  
  // Simple checkout data extraction - let LLM decide when to show checkout
  const checkoutData = message.data?.initiate_checkout;
  
  // Simple order confirmation detection - use API data OR content
  const isOrderConfirmation = isBot && (
    message.data?.place_order?.order || 
    message.content?.includes('Order ID:')
  );
  
  // Check if showing product cards (search results, recommendations)
  const hasProductCards = products.length > 0 || recommendedProducts.length > 0;
  
  // Clean message content - remove technical data for better UX
  const cleanMessageContent = (content) => {
    if (!content) return content;
    
    // If message contains STRUCTURED_DATA, show only the clean part
    if (content.includes('STRUCTURED_DATA:')) {
      const cleanPart = content.split('STRUCTURED_DATA:')[0].trim();
      return cleanPart;
    }
    
    return content;
  };

  return (
    <div className={`mb-6 flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[95%] md:max-w-[90%] lg:max-w-[85%] w-full ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
            isBot 
              ? 'bg-gradient-to-br from-boutique-500 to-primary-500 text-white mr-3' 
              : 'bg-gray-600 text-white ml-3'
          }`}
        >
          {isBot ? (
            <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </motion.div>

        {/* Message Content */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-sm ${
              isBot
                ? message.isError
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-white border border-gray-200 text-gray-800'
                : 'bg-gradient-to-r from-boutique-500 to-primary-500 text-white'
            } ${isBot ? 'rounded-bl-md' : 'rounded-br-md'}`}
          >
            {/* Show minimal text for cart/checkout/order responses, full text for others */}
            {cartData ? (
              // Minimal text for cart - just show a brief message
              <div className="text-sm text-gray-600 mb-2">
                Here's your cart with {cartData.items?.length || 0} item{cartData.items?.length !== 1 ? 's' : ''}:
              </div>
            ) : checkoutData ? (
              // Minimal text for checkout - use LLM's message or default
              <div className="text-sm text-gray-600 mb-2">
                {checkoutData.message || 'Ready to complete your order? Please fill out the form below:'}
              </div>
            ) : isOrderConfirmation ? (
              // Minimal text for order confirmation
              <div className="text-sm text-gray-600 mb-2">
                Order placed successfully! Here are your details:
              </div>
            ) : hasProductCards ? (
              // Simple "Found" message for product search results
              <div className="text-sm text-gray-600 mb-2">
                Found {products.length} {products.length === 1 ? 'product' : 'products'}
              </div>
            ) : (
              // Full markdown content for other responses
              <div className={`message-content text-sm md:text-base leading-tight max-w-full break-words overflow-hidden ${
                isBot ? 'text-gray-800' : 'text-white'
              }`}>
                <ReactMarkdown>
                  {cleanMessageContent(message.content)}
                </ReactMarkdown>
              </div>
            )}

            {/* Cart View */}
            {cartData && (
              <div className="mt-2">
                <CartView cartData={cartData} allMessageData={message.data} />
              </div>
            )}

            {/* Checkout Form */}
            {checkoutData && (
              <div className="mt-2">
                <CheckoutForm 
                  onPlaceOrder={onSendMessage}
                  isLoading={false}
                />
              </div>
            )}

            {/* Order Confirmation - only show when we have actual API data */}
            {message.data?.place_order?.order && (
              <div className="mt-2">
                <OrderConfirmation message={message} />
              </div>
            )}

            {/* Main Product Cards - only show if not displaying cart */}
            {products.length > 0 && !cartData && (
              <div className="mt-4 space-y-3">
                {products.map((product, index) => (
                  <ProductCard 
                    key={index} 
                    product={product} 
                    delay={0.4 + index * 0.1}
                    onAddToCart={onSendMessage}
                  />
                ))}
              </div>
            )}

            {/* Promotional Ads */}
            {adsData?.ads && adsData.ads.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-600 mb-2">🏷️ Special Offers</div>
                <div className="space-y-2">
                  {adsData.ads.map((ad, index) => {
                    // Extract product ID from redirect_url (e.g., "/product/L9ECAV7KIM" -> "L9ECAV7KIM")
                    const productId = ad.redirect_url?.split('/').pop();
                    
                    // Let the LLM intelligently understand the promotional text
                    const getSearchMessage = (adText) => {
                      return adText; // Just send the ad text directly - let the LLM figure it out!
                    };
                    
                    return (
                      <div 
                        key={index}
                        className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 cursor-pointer hover:from-red-100 hover:to-orange-100 transition-colors"
                        onClick={() => {
                          if (onSendMessage) {
                            // Send descriptive message instead of cryptic product ID
                            const searchMessage = getSearchMessage(ad.text);
                            onSendMessage(searchMessage, false);
                          }
                        }}
                      >
                        <div className="text-sm font-medium text-red-800">
                          {ad.text}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Click to view product details
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* You May Also Like Section */}
            {recommendedProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  You May Also Like
                </h3>
                
                {/* Container with navigation arrows */}
                <div className="relative">
                  {/* Left Arrow */}
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    style={{ marginLeft: '-12px' }}
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    style={{ marginRight: '-12px' }}
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Horizontal scrollable container */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide px-6"
                  >
                    {recommendedProducts.map((product, index) => (
                      <div key={`rec-${product.id}-${index}`} className="flex-shrink-0 w-64">
                        <ProductCard 
                          product={product} 
                          delay={0.6 + index * 0.1}
                          onAddToCart={onSendMessage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Timestamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-1 text-xs text-gray-500 ${
              isBot ? 'text-left ml-1' : 'text-right mr-1'
            }`}
          >
            {formatTime(message.timestamp)}
          </motion.div>

          {/* Quick Replies */}
          {isBot && message.quickReplies && message.quickReplies.length > 0 && (
            <QuickReplies 
              replies={message.quickReplies} 
              onReply={onQuickReply}
              delay={0.6}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Message;
