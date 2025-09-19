import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  MapPinIcon, 
  EnvelopeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const CheckoutForm = ({ onPlaceOrder, isLoading = false }) => {
  const [formData, setFormData] = useState({
    user_id: 'arjun',
    user_currency: 'USD',
    street_address: '1600 Amphitheatre Parkway',
    city: 'Mountain View',
    state: 'CA',
    country: 'US',
    zip_code: '94043',
    email: 'arjun@test.com',
    credit_card_number: '4432801234567890', // Valid test card
    credit_card_cvv: '234',
    credit_card_expiration_year: '2025',
    credit_card_expiration_month: '12'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = [
      'street_address', 'city', 'state', 'zip_code', 'email',
      'credit_card_number', 'credit_card_cvv', 'credit_card_expiration_year', 'credit_card_expiration_month'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Credit card validation (basic)
    if (formData.credit_card_number && formData.credit_card_number.replace(/\s/g, '').length < 13) {
      newErrors.credit_card_number = 'Please enter a valid credit card number';
    }

    if (formData.credit_card_cvv && (formData.credit_card_cvv.length < 3 || formData.credit_card_cvv.length > 4)) {
      newErrors.credit_card_cvv = 'CVV must be 3 or 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (onPlaceOrder) {
      // Format structured data for place_order function
      const orderData = {
        user_id: formData.user_id,
        user_currency: formData.user_currency,
        address: {
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip_code: parseInt(formData.zip_code)
        },
        email: formData.email,
        credit_card: {
          credit_card_number: formData.credit_card_number.replace(/\s/g, ''), // Remove spaces
          credit_card_cvv: parseInt(formData.credit_card_cvv),
          credit_card_expiration_year: parseInt(formData.credit_card_expiration_year),
          credit_card_expiration_month: parseInt(formData.credit_card_expiration_month)
        }
      };
      
      // Send clean user message with hidden structured data
      const orderMessage = `Please place my order for the items in my cart. Order details: user_id=${orderData.user_id}, email=${orderData.email}, shipping to ${orderData.address.city}, ${orderData.address.state}. STRUCTURED_DATA:${JSON.stringify(orderData)}`;
      onPlaceOrder(orderMessage, true); // true = silent (no user message shown)
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boutique-500 focus:border-transparent transition-colors";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-boutique-500 to-primary-500 text-white p-6">
        <div className="flex items-center space-x-3">
          <ShoppingCartIcon className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Checkout</h2>
        </div>
        <p className="text-boutique-100 mt-2">Complete your order below</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              className={inputClasses}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              name="user_currency"
              value={formData.user_currency}
              onChange={handleInputChange}
              className={inputClasses}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5 text-boutique-500" />
            <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
            <input
              type="text"
              name="street_address"
              value={formData.street_address}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="123 Main Street"
            />
            {errors.street_address && <p className={errorClasses}>{errors.street_address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="New York"
              />
              {errors.city && <p className={errorClasses}>{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="NY"
              />
              {errors.state && <p className={errorClasses}>{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="10001"
              />
              {errors.zip_code && <p className={errorClasses}>{errors.zip_code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={inputClasses}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <EnvelopeIcon className="w-5 h-5 text-boutique-500" />
            <label className="block text-sm font-medium text-gray-700">Email Address *</label>
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="john@example.com"
          />
          {errors.email && <p className={errorClasses}>{errors.email}</p>}
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-5 h-5 text-boutique-500" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
            <input
              type="text"
              name="credit_card_number"
              value={formData.credit_card_number}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {errors.credit_card_number && <p className={errorClasses}>{errors.credit_card_number}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
              <input
                type="text"
                name="credit_card_cvv"
                value={formData.credit_card_cvv}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="123"
                maxLength="4"
              />
              {errors.credit_card_cvv && <p className={errorClasses}>{errors.credit_card_cvv}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exp Month *</label>
              <select
                name="credit_card_expiration_month"
                value={formData.credit_card_expiration_month}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">Month</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                ))}
              </select>
              {errors.credit_card_expiration_month && <p className={errorClasses}>{errors.credit_card_expiration_month}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exp Year *</label>
              <select
                name="credit_card_expiration_year"
                value={formData.credit_card_expiration_year}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">Year</option>
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              {errors.credit_card_expiration_year && <p className={errorClasses}>{errors.credit_card_expiration_year}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-boutique-500 to-primary-500 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Order...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Place Order</span>
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CheckoutForm;
