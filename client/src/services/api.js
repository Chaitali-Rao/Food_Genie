import axios from 'axios';

// Resolve base URL from environment or fallback to Vite proxy path
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Pre-configured Axios instance for Food Genie.
 * Provides unified request configuration, timeouts, and interceptors.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects auth token if present (prepared for Phase 2 JWT)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('food_genie_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardizes error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Network error - please verify that the Food Genie backend is running.',
      status: error.response?.status || 500,
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };
    return Promise.reject(customError);
  }
);

export default api;

