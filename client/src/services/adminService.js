import api from './api';

export const adminService = {
  /**
   * Fetch real-time aggregated dashboard analytics
   */
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Fetch all orders with optional status filter
   */
  async getAllOrders(params = {}) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Update order status with optional note
   */
  async updateOrderStatus(orderId, status, note = '') {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status, note });
    return response.data;
  },

  /**
   * Fetch all food items including out of stock items
   */
  async getAllFoods() {
    const response = await api.get('/admin/foods');
    return response.data;
  },

  /**
   * Toggle 1-click in-stock / out-of-stock availability
   */
  async toggleFoodStock(foodId) {
    const response = await api.put(`/admin/foods/${foodId}/toggle-stock`);
    return response.data;
  },

  /**
   * Create a new food dish
   */
  async createFood(foodData) {
    const response = await api.post('/foods', foodData);
    return response.data;
  },

  /**
   * Update an existing food dish
   */
  async updateFood(foodId, foodData) {
    const response = await api.put(`/foods/${foodId}`, foodData);
    return response.data;
  },

  /**
   * Delete a food dish
   */
  async deleteFood(foodId) {
    const response = await api.delete(`/foods/${foodId}`);
    return response.data;
  },
};

export default adminService;

