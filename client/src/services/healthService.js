import api from './api';

/**
 * Health service to monitor backend API and database connectivity.
 */
export const healthService = {
  /**
   * Ping backend health endpoint and compute round-trip latency.
   * @returns {Promise<{ data: Object, latencyMs: number }>}
   */
  async checkHealth() {
    const startTime = performance.now();
    try {
      const response = await api.get('/health');
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        data: response.data,
        latencyMs,
        error: null,
      };
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        data: null,
        latencyMs,
        error,
      };
    }
  },
};

export default healthService;

