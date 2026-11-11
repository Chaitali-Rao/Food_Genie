import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication endpoints
router.post('/register', register);
router.post('/login', login);

// Private User Profile endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin-only endpoints (Role-Based Access Control)
router.get('/users', protect, adminOnly, getAllUsers);

export default router;

