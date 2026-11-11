import express from 'express';
import {
  chatWithGenie,
  getCartPairings,
  getQuickSuggestions,
} from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Conversational food recommendations with Genie
 */
router.post('/chat', chatWithGenie);

/**
 * @route   POST /api/ai/pair
 * @desc    Cart-aware food & beverage pairings
 */
router.post('/pair', getCartPairings);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get quick prompt pills
 */
router.get('/suggestions', getQuickSuggestions);

export default router;

