import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  simulateOrderProgress,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer protected endpoints
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/simulate-step', protect, simulateOrderProgress);
router.put('/:id/cancel', protect, cancelOrder);

// Admin-only order status transition endpoint
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;

