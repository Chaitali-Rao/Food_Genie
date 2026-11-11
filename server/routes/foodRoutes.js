import express from 'express';
import {
  getFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/foodController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public food browsing routes
router.get('/', getFoods);
router.get('/categories', getCategories);
router.get('/:id', getFoodById);

// Admin-only food management routes (RBAC)
router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

export default router;

