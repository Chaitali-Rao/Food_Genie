import api from './api';

export const foodService = {
  /**
   * Fetch foods with optional filtering, search, sorting and pagination
   * @param {Object} params
   * @param {string} [params.search]
   * @param {string} [params.category]
   * @param {boolean|string} [params.isVeg]
   * @param {number|string} [params.spicyLevel]
   * @param {string} [params.sort]
   * @param {number} [params.page]
   * @param {number} [params.limit]
   */
  async getFoods(params = {}) {
    const response = await api.get('/foods', { params });
    return response.data;
  },

  /**
   * Fetch single food item by ID
   * @param {string} id
   */
  async getFoodById(id) {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },

  /**
   * Fetch all active categories with counts
   */
  async getCategories() {
    const response = await api.get('/foods/categories');
    return response.data;
  },
};

export default foodService;

