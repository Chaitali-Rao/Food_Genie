import express from 'express';
import {
  getAdminStats,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAllFoodsAdmin,
  toggleFoodStock,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require valid JWT and role === 'admin'
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatusAdmin);
router.get('/foods', getAllFoodsAdmin);
router.put('/foods/:id/toggle-stock', toggleFoodStock);

export default router;

