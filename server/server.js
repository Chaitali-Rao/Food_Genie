// Food Genie Server - AI Service v2.1 (Live Reloaded)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { seedDatabase } from './utils/seedData.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Food Genie Backend API',
    description: 'AI-Powered Food Ordering Platform',
    version: '1.0.0',
    documentation: '/api/health for system status',
  });
});

// Mount modular routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Connect to MongoDB and start HTTP listener
export const startServer = async () => {
  await connectDB();
  await seedDatabase();

  const server = app.listen(PORT, () => {
    console.log(`[Food Genie Server] Running on http://localhost:${PORT}`);
    console.log(`[Food Genie Server] Health check available at http://localhost:${PORT}/api/health`);
    console.log(`[Food Genie Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = () => {
    console.log('\n[Food Genie Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Food Genie Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
};

// Check if this file is executed directly (ES module equivalent of require.main === module)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  startServer();
}

export default app;
