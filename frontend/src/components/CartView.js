import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartView = ({ cartData, allMessageData }) => {
  const items = cartData?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Simple: get product info from API data if available
  const getProductInfo = (productId) => {
    // Check both get_product and get_product_with_image
    const sources = [allMessageData?.get_product, allMessageData?.get_product_with_image];
    
    for (const source of sources) {
      if (!source) continue;
      
      // Handle both single product and array of products
      if (Array.isArray(source)) {
        const found = source.find(product => product && product.id === productId);
        if (found) return found;
      } else if (source && source.id === productId) {
        return source;
      }
    }
    
    return null;
  };

  // Simple: format price from API data
  const formatPrice = (product) => {
    if (product?.price_usd) {
      return (product.price_usd.units + (product.price_usd.nanos || 0) / 1000000000).toFixed(2);
    }
    return null;
  };

  // Simple: get shipping address from API data if available
  const getShippingAddress = () => {
    // Check if address info is available in the shipping quote response
    if (allMessageData?.get_shipping_quote?.shipping_address) {
      return allMessageData.get_shipping_quote.shipping_address;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto"
    >
      {/* Cart Header */}
      <div className="bg-gradient-to-r from-boutique-500 to-primary-500 text-white p-4">
        <div className="flex items-center space-x-3">
          <ShoppingCartIcon className="w-6 h-6" />
          <h2 className="text-xl font-bold">Cart ({itemCount})</h2>
        </div>
      </div>

      {/* Rich Cart Items */}
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = getProductInfo(item.product_id);
              const price = formatPrice(product);
              
              return (
                <div key={item.product_id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  {product?.picture ? (
                    <img 
                      src={product.picture} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {product?.name || `Product #${item.product_id}`}
                    </h3>
                    <p className="text-sm text-gray-500">SKU #{item.product_id}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {product?.categories && (
                      <p className="text-xs text-boutique-600">{product.categories.join(', ')}</p>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    {price ? (
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          ${(parseFloat(price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">${price} each</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Loading...</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary with Shipping (if we have price data) */}
            {items.some(item => getProductInfo(item.product_id) && formatPrice(getProductInfo(item.product_id))) && (
              <div className="border-t pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    ${items.reduce((total, item) => {
                      const product = getProductInfo(item.product_id);
                      const price = formatPrice(product);
                      return total + (price ? parseFloat(price) * item.quantity : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                
                {/* Shipping (if available from API) */}
                {allMessageData?.get_shipping_quote && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      ${((allMessageData.get_shipping_quote.cost_usd?.units || 0) + 
                        ((allMessageData.get_shipping_quote.cost_usd?.nanos || 0) / 1000000000)).toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      ${(items.reduce((total, item) => {
                        const product = getProductInfo(item.product_id);
                        const price = formatPrice(product);
                        return total + (price ? parseFloat(price) * item.quantity : 0);
                      }, 0) + 
                      (allMessageData?.get_shipping_quote ? 
                        (allMessageData.get_shipping_quote.cost_usd?.units || 0) + 
                        ((allMessageData.get_shipping_quote.cost_usd?.nanos || 0) / 1000000000) : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipping Address Section */}
        {getShippingAddress() && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="space-y-2 text-sm">
              {getShippingAddress().email && (
                <div>
                  <span className="text-gray-500">E-mail Address:</span>
                  <span className="ml-2 text-gray-900">{getShippingAddress().email}</span>
                </div>
              )}
              {getShippingAddress().street_address && (
                <div>
                  <span className="text-gray-500">Street Address:</span>
                  <span className="ml-2 text-gray-900">{getShippingAddress().street_address}</span>
                </div>
              )}
              <div className="flex space-x-4">
                {getShippingAddress().zip_code && (
                  <div>
                    <span className="text-gray-500">Zip Code:</span>
                    <span className="ml-2 text-gray-900">{getShippingAddress().zip_code}</span>
                  </div>
                )}
                {getShippingAddress().city && (
                  <div>
                    <span className="text-gray-500">City:</span>
                    <span className="ml-2 text-gray-900">{getShippingAddress().city}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                {getShippingAddress().state && (
                  <div>
                    <span className="text-gray-500">State:</span>
                    <span className="ml-2 text-gray-900">{getShippingAddress().state}</span>
                  </div>
                )}
                {getShippingAddress().country && (
                  <div>
                    <span className="text-gray-500">Country:</span>
                    <span className="ml-2 text-gray-900">{getShippingAddress().country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CartView;


