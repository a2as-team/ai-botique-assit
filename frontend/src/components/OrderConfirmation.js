import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, EnvelopeIcon, TruckIcon, CurrencyDollarIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const OrderConfirmation = ({ message }) => {
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Use API data directly - correct structure
  const orderData = message?.data?.place_order?.order;

  // Fetch product details for all items
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!orderData?.items) {
        setLoadingProducts(false);
        return;
      }

      const details = {};
      setLoadingProducts(true);

      try {
        // Fetch details for each product
        for (const item of orderData.items) {
          const productId = item.item?.product_id;
          if (productId && !details[productId]) {
            try {
              const response = await fetch(`/api/products/${productId}`);
              if (response.ok) {
                const productData = await response.json();
                details[productId] = productData;
              }
            } catch (error) {
              console.error(`Failed to fetch product ${productId}:`, error);
              // Fallback product data
              details[productId] = {
                id: productId,
                name: `Product ${productId}`,
                picture: null
              };
            }
          }
        }

        setProductDetails(details);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductDetails();
  }, [orderData?.items]);

  // Early returns after hooks
  if (!message?.data?.place_order?.order) return null;
  if (!orderData) return null;

  // Calculate total from items and shipping cost
  const calculateTotal = () => {
    let total = 0;
    
    // Add item costs
    if (orderData.items) {
      orderData.items.forEach(item => {
        if (item.cost) {
          total += (item.cost.units || 0) + (item.cost.nanos || 0) / 1000000000;
        }
      });
    }
    
    // Add shipping cost
    if (orderData.shipping_cost) {
      total += (orderData.shipping_cost.units || 0) + (orderData.shipping_cost.nanos || 0) / 1000000000;
    }
    
    return total;
  };

  const totalCost = calculateTotal();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl font-bold mb-2">Your order is complete!</h1>
        <p className="text-green-100 text-lg">We've sent you a confirmation email.</p>
      </div>

      {/* Order Details */}
      <div className="p-8 space-y-6">
        {/* Confirmation Number */}
        <div className="flex justify-between items-center py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600 font-medium">Confirmation #</span>
          </div>
          <span className="text-gray-900 font-mono text-sm">{orderData.order_id}</span>
        </div>

        {/* Tracking Number */}
        {orderData.shipping_tracking_id && (
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <TruckIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Tracking #</span>
            </div>
            <span className="text-gray-900 font-mono text-sm">{orderData.shipping_tracking_id}</span>
          </div>
        )}

        {/* Shipping Address */}
        {orderData.shipping_address && (
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Shipping Address</span>
            </div>
            <div className="ml-8 text-gray-700 text-sm">
              <p>{orderData.shipping_address.street_address}</p>
              <p>{orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.zip_code}</p>
              <p>{orderData.shipping_address.country}</p>
            </div>
          </div>
        )}

        {/* Items */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Items Ordered</span>
            </div>
            <div className="space-y-4">
              {orderData.items.map((item, index) => {
                const unitPrice = (item.cost?.units || 0) + (item.cost?.nanos || 0) / 1000000000;
                const quantity = item.item?.quantity || 1;
                const lineTotal = unitPrice * quantity;
                const productId = item.item?.product_id;
                const product = productDetails[productId];
                
                return (
                  <div key={index} className="flex items-start space-x-4 bg-gray-50 rounded-lg p-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {loadingProducts ? (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      ) : product?.picture ? (
                        <img
                          src={product.picture}
                          alt={product.name || productId}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAyMUg0M1Y0M0gyMVYyMVoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {loadingProducts ? (
                              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                            ) : (
                              product?.name || `Product ${productId}`
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Product ID: {productId}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {quantity}
                          </p>
                        </div>
                        
                        {/* Pricing */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${unitPrice.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shipping Cost */}
        {orderData.shipping_cost && (
          <div className="flex justify-between items-center py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <TruckIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-medium">Shipping Cost</span>
            </div>
            <span className="text-gray-900 font-medium">
              ${((orderData.shipping_cost.units || 0) + (orderData.shipping_cost.nanos || 0) / 1000000000).toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Paid */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600 font-medium text-lg">Total Paid</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-6 text-center">
        <p className="text-gray-600 text-sm">
          Thank you for your order! You'll receive shipping updates via email.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
