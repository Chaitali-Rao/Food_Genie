import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    API and DB health check endpoint
 * @access  Public
 */
router.get('/', getHealth);

export default router;

