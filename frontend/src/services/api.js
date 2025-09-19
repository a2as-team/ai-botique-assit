import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (window.location.origin + '/api'),
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error - please try again later');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Service not found - please check if the backend is running');
    }
    
    throw error;
  }
);

/**
 * Create a new chat session
 * @returns {Promise<Object>} Session data
 */
export const createSession = async () => {
  try {
    const response = await api.post('/session');
    return response.data;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create chat session. Please ensure the backend server is running.');
  }
};

/**
 * Send a message to the chat API
 * @param {string} message - The user message
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} Chat response
 */
export const sendMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat', {
      message,
      sessionId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    throw new Error('Failed to send message. Please try again.');
  }
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Backend service is not responding');
  }
};

export default api;
