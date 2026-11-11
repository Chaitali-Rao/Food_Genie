import api from './api';

export const aiService = {
  /**
   * Send a message to Genie AI food recommender
   * @param {Object} payload
   * @param {string} payload.message
   * @param {Array} [payload.history]
   * @param {Array} [payload.cartItems]
   * @param {Object} [payload.userPreferences]
   */
  async sendMessage({ message, history = [], cartItems = [], userPreferences = {} }) {
    const response = await api.post('/ai/chat', {
      message,
      history,
      cartItems,
      userPreferences,
    });
    return response.data;
  },

  /**
   * Request complementary food or drink pairings based on active cart
   * @param {Array} cartItems
   */
  async getCartPairings(cartItems = []) {
    const response = await api.post('/ai/pair', { cartItems });
    return response.data;
  },

  /**
   * Fetch quick inspiration prompt pills
   */
  async getSuggestions() {
    const response = await api.get('/ai/suggestions');
    return response.data;
  },
};

export default aiService;

