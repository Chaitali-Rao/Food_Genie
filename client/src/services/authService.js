import api from './api';

const TOKEN_KEY = 'food_genie_token';
const USER_KEY = 'food_genie_user';

export const authService = {
  /**
   * Register a new user account
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Log in an existing user
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Fetch latest profile from backend
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    if (response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  /**
   * Update profile fields (name, phone, address, password)
   */
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  },

  /**
   * Admin-only: Fetch all registered users
   */
  async getAllUsers() {
    const response = await api.get('/auth/users');
    return response.data;
  },

  /**
   * Log out user and clear stored tokens
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached user from localStorage
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get cached JWT token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;

