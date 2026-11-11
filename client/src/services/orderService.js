import api from './api';

export const orderService = {
  /**
   * Place a new order
   * @param {Object} orderData
   */
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Get all orders of current user
   */
  async getMyOrders() {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  /**
   * Get specific order details by ID
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Advance order status to next step (Live simulation utility)
   * @param {string} orderId
   */
  async simulateOrderStep(orderId) {
    const response = await api.put(`/orders/${orderId}/simulate-step`);
    return response.data;
  },

  /**
   * Cancel an order
   * @param {string} orderId
   * @param {string} reason
   */
  async cancelOrder(orderId, reason) {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

export default orderService;

