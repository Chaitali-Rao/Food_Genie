import { getDbStatus } from '../config/db.js';

/**
 * @desc   Check API and database health status
 * @route  GET /api/health
 * @access Public
 */
export const getHealth = (req, res) => {
  const db = getDbStatus();
  const isHealthy = db.readyState === 1;

  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  };

  const responsePayload = {
    success: true,
    service: 'Food Genie API',
    version: '1.0.0',
    status: isHealthy ? 'operational' : 'degraded',
    message: isHealthy
      ? 'All systems operational: Food Genie API and MongoDB connected'
      : 'API operational, MongoDB disconnected (degraded mode)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: db,
    memory: memoryMB,
  };

  // Return HTTP 200 even if degraded, but report status in JSON
  res.status(200).json(responsePayload);
};

