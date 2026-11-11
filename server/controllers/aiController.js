import aiService from '../services/aiService.js';

/**
 * @desc    Process conversational AI food recommendations
 * @route   POST /api/ai/chat
 * @access  Public (Optionally Authenticated)
 */
export const chatWithGenie = async (req, res, next) => {
  try {
    const { message, history = [], cartItems = [], userPreferences = {} } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a food query or conversation message for Genie',
      });
    }

    // Process request through AI Service
    const result = await aiService.processChatMessage({
      message: message.trim(),
      history,
      cartItems,
      userPreferences,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complementary food pairings based on current shopping cart
 * @route   POST /api/ai/pair
 * @access  Public
 */
export const getCartPairings = async (req, res, next) => {
  try {
    const { cartItems = [] } = req.body;

    const result = await aiService.getCartPairings(cartItems);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick prompt suggestions to kickstart Genie chat
 * @route   GET /api/ai/suggestions
 * @access  Public
 */
export const getQuickSuggestions = (req, res) => {
  const suggestions = aiService.getQuickSuggestions();
  res.status(200).json({
    success: true,
    suggestions,
  });
};

