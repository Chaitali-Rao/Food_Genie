import Food from '../models/Food.js';
import Category from '../models/Category.js';

/**
 * Natural language intent parser for food queries
 */
const parseUserIntent = (text = '', userPreferences = {}) => {
  const query = text.toLowerCase().trim();

  // 0. Conversational Intents
  const greetingPatterns = [
    /^hi[\s!.]*$/i,
    /^hello[\s!.]*$/i,
    /^hey[\s!.]*$/i,
    /^hiya[\s!.]*$/i,
    /^hola[\s!.]*$/i,
    /^namaste[\s!.]*$/i,
    /^yo[\s!.]*$/i,
    /^sup[\s!.]*$/i,
    /^good\s*(morning|afternoon|evening|day)[\s!.]*$/i,
    /^greetings[\s!.]*$/i,
  ];
  const isPureGreeting = greetingPatterns.some((regex) => regex.test(query));

  const smallTalkPatterns = [
    /how\s+(are|r)\s+(you|u|ya)/i,
    /how('s|s|\s+is)\s+it\s+going/i,
    /how\s+do\s+you\s+do/i,
    /what('s|s|\s+is)\s+up/i,
    /wassup/i,
    /how\s+are\s+things/i,
    /how\s+have\s+you\s+been/i,
  ];
  const isSmallTalk = smallTalkPatterns.some((regex) => regex.test(query));

  const isHelp =
    query.includes('who are you') ||
    query.includes('what is your name') ||
    query.includes("what's your name") ||
    query.includes('what can you do') ||
    query.includes('how do you work') ||
    query.includes('help me') ||
    query === 'help';

  const isThanks =
    query.includes('thank you') ||
    query.includes('thanks') ||
    query.includes('thx') ||
    query.includes('ty') ||
    query.includes('appreciate it');

  const isJoke =
    query.includes('joke') ||
    query.includes('funny') ||
    query.includes('make me laugh');

  // 1. Dietary Preference
  let isVeg = userPreferences.isVeg !== undefined ? userPreferences.isVeg : null;
  if (
    query.includes('pure veg') ||
    query.includes('vegetarian') ||
    query.includes('veggie') ||
    query.includes('veg only') ||
    query.includes('no meat') ||
    query.includes('plant based')
  ) {
    isVeg = true;
  } else if (
    query.includes('non veg') ||
    query.includes('non-veg') ||
    query.includes('chicken') ||
    query.includes('meat') ||
    query.includes('mutton') ||
    query.includes('fish') ||
    query.includes('prawn')
  ) {
    isVeg = false;
  }

  // 2. Spice Level Tolerance
  let spicyLevel = userPreferences.spicyLevel !== undefined ? userPreferences.spicyLevel : null;
  if (
    query.includes('mild') ||
    query.includes('not spicy') ||
    query.includes('no spice') ||
    query.includes('sweet') ||
    query.includes('low spice') ||
    query.includes('kid friendly')
  ) {
    spicyLevel = 0;
  } else if (
    query.includes('extra spicy') ||
    query.includes('very hot') ||
    query.includes('super spicy') ||
    query.includes('fire') ||
    query.includes('flaming')
  ) {
    spicyLevel = 3;
  } else if (
    query.includes('spicy') ||
    query.includes('hot') ||
    query.includes('fiery') ||
    query.includes('tangy')
  ) {
    spicyLevel = 2;
  }

  // 3. Price / Budget Ceiling
  let maxBudget = null;
  const budgetMatch =
    query.match(/(?:under|less\s+than|below|within|max|around)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
    query.match(/(?:rs\.?|inr|₹)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  } else if (query.includes('cheap') || query.includes('budget') || query.includes('pocket friendly')) {
    maxBudget = 350;
  }

  // 4. Mood, Cravings and Keywords
  const cravingKeywords = [];
  const keywordMap = {
    cheesy: ['cheese', 'cheesy', 'mozzarella', 'parmesan', 'pizza'],
    crispy: ['crispy', 'crunchy', 'fried', 'tempura', 'patty'],
    comfort: ['comfort', 'rich', 'creamy', 'warm', 'biryani', 'pasta'],
    healthy: ['healthy', 'salad', 'diet', 'protein', 'low carb', 'green', 'fresh', 'light', 'clean', 'fitness'],
    sweet: ['sweet', 'dessert', 'chocolate', 'cake', 'sugar', 'ice cream', 'pastry'],
    refreshing: ['drink', 'beverage', 'shake', 'smoothie', 'refreshing', 'soda', 'cool', 'juice', 'thirst'],
    quick: ['quick', 'fast', 'snack', 'bite', 'finger food'],
    italian: ['pizza', 'pasta', 'risotto', 'italian'],
    asian: ['asian', 'noodles', 'ramen', 'dumplings', 'wok', 'pad thai'],
    indian: ['biryani', 'curry', 'tikka', 'masala', 'paneer'],
    southIndian: ['dosa', 'idli', 'vada', 'sambar', 'chutney', 'podi', 'south indian', 'kerala', 'parotta', 'rasam', 'uttapam', 'filter coffee', 'kaapi'],
    burger: ['burger', 'brioche', 'fries'],
  };

  for (const [concept, triggers] of Object.entries(keywordMap)) {
    if (triggers.some((word) => query.includes(word))) {
      cravingKeywords.push(concept);
    }
  }

  // 5. Special Intents
  const isSurprise =
    query.includes('surprise') ||
    query.includes('anything') ||
    query.includes('chef special') ||
    query.includes("what's good") ||
    query.includes('recommend something') ||
    query.includes('what should i eat') ||
    query.includes('im hungry') ||
    query.includes("i'm hungry") ||
    query.includes('suggest something');

  const isPairing =
    query.includes('pair') ||
    query.includes('goes with') ||
    query.includes('drink with') ||
    query.includes('side with') ||
    query.includes('complement') ||
    query.includes('with my order');

  return {
    rawQuery: query,
    isPureGreeting,
    isSmallTalk,
    isHelp,
    isThanks,
    isJoke,
    isVeg,
    spicyLevel,
    maxBudget,
    cravingKeywords,
    isSurprise,
    isPairing,
  };
};

/**
 * Heuristic AI recommendation scoring engine with diversity & randomness
 */
const recommendDishes = async (intent, cartItems = [], limit = 3) => {
  // Query all active dishes with category populated
  const allFoods = await Food.find({ isAvailable: true }).populate('category', 'name slug icon');

  if (!allFoods || allFoods.length === 0) {
    return {
      recommendations: [],
      reasoning: 'Our kitchen is currently updating the catalog. Please check back shortly!',
    };
  }

  // If user asked to be surprised or general hunger, select diverse items from different categories
  if (intent.isSurprise) {
    // Group foods by category
    const categorized = {};
    allFoods.forEach((f) => {
      const catKey = f.category?.slug || 'other';
      if (!categorized[catKey]) categorized[catKey] = [];
      categorized[catKey].push(f);
    });

    const categoryKeys = Object.keys(categorized).sort(() => 0.5 - Math.random());
    const surprisePicks = [];

    categoryKeys.forEach((k) => {
      if (surprisePicks.length < limit) {
        const pool = categorized[k].filter((dish) => {
          if (intent.isVeg !== null && dish.isVeg !== intent.isVeg) return false;
          if (intent.maxBudget !== null && dish.price > intent.maxBudget) return false;
          return true;
        });
        if (pool.length > 0) {
          const randomDish = pool[Math.floor(Math.random() * pool.length)];
          surprisePicks.push(randomDish);
        }
      }
    });

    if (surprisePicks.length > 0) {
      return { recommendations: surprisePicks, intent };
    }
  }

  // Scoring function
  const scoredFoods = allFoods.map((food) => {
    let score = 0;
    const foodNameLower = food.name.toLowerCase();
    const foodDescLower = food.description.toLowerCase();
    const catNameLower = food.category?.name?.toLowerCase() || '';
    const tagsLower = (food.tags || []).map((t) => t.toLowerCase());

    // 1. Dietary Preference Matching
    if (intent.isVeg !== null) {
      if (food.isVeg === intent.isVeg) {
        score += 45;
      } else {
        score -= 120;
      }
    }

    // 2. Budget Matching
    if (intent.maxBudget !== null) {
      if (food.price <= intent.maxBudget) {
        score += 35;
        score += Math.max(0, 10 - Math.floor((intent.maxBudget - food.price) / 30));
      } else {
        score -= 70;
      }
    }

    // 3. Spice Level Matching
    if (intent.spicyLevel !== null) {
      const diff = Math.abs((food.spicyLevel ?? 1) - intent.spicyLevel);
      if (diff === 0) score += 25;
      else if (diff === 1) score += 10;
      else score -= 15;
    }

    // 4. Keyword and Concept Matching
    if (intent.rawQuery && !intent.isPureGreeting) {
      if (foodNameLower.includes(intent.rawQuery) || intent.rawQuery.includes(foodNameLower)) {
        score += 60;
      }
      if (intent.rawQuery.includes(catNameLower)) {
        score += 35;
      }
      tagsLower.forEach((tag) => {
        if (intent.rawQuery.includes(tag)) {
          score += 20;
        }
      });
    }

    // Cravings concepts
    if (
      intent.cravingKeywords.includes('cheesy') &&
      (foodDescLower.includes('cheese') || tagsLower.includes('cheesy') || catNameLower.includes('pizza'))
    ) {
      score += 35;
    }
    if (
      intent.cravingKeywords.includes('healthy') &&
      (food.isVeg || catNameLower.includes('greens') || food.calories < 450)
    ) {
      score += 35;
    }
    if (
      intent.cravingKeywords.includes('sweet') &&
      (catNameLower.includes('dessert') || tagsLower.includes('sweet'))
    ) {
      score += 45;
    }
    if (
      intent.cravingKeywords.includes('refreshing') &&
      (catNameLower.includes('beverage') || catNameLower.includes('drink'))
    ) {
      score += 45;
    }
    if (
      intent.cravingKeywords.includes('asian') &&
      (catNameLower.includes('asian') || catNameLower.includes('wok'))
    ) {
      score += 40;
    }
    if (
      intent.cravingKeywords.includes('italian') &&
      (catNameLower.includes('pizza') || tagsLower.includes('italian'))
    ) {
      score += 40;
    }
    if (
      intent.cravingKeywords.includes('indian') &&
      (catNameLower.includes('biryani') || tagsLower.includes('indian'))
    ) {
      score += 40;
    }
    if (intent.cravingKeywords.includes('burger') && catNameLower.includes('burger')) {
      score += 40;
    }

    // 5. Rating and subtle variety jitter
    score += (food.rating || 4.5) * 3;
    score += Math.random() * 2; // Subtle jitter to avoid frozen repetition on ties

    // 6. Cart Synergy
    const isInCart = cartItems.some(
      (item) => item.food === food._id.toString() || item.foodId === food._id.toString()
    );
    if (isInCart) {
      score -= 30;
    }

    return {
      food,
      score,
    };
  });

  // Sort descending by score
  scoredFoods.sort((a, b) => b.score - a.score);

  const topRecommendations = scoredFoods
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.food);

  const recommendations =
    topRecommendations.length > 0 ? topRecommendations : allFoods.slice(0, limit);

  return {
    recommendations,
    intent,
  };
};

/**
 * Generate conversational Genie response text based on recommendations & parsed intent
 */
const generateGenieSpeech = (intent, recommendations) => {
  if (recommendations.length === 0) {
    return "🧞 Greetings traveler! I searched our royal kitchen, but couldn't find an exact match for those specific filters. How about trying a different cuisine or budget?";
  }

  const dishNames = recommendations.map((d) => `**${d.name}** (₹${d.price})`).join(', ');

  if (intent.isSurprise) {
    return `✨ Abracadabra! Here are my chef's hand-picked surprises across our kitchens: ${dishNames}. Each is crafted fresh to order!`;
  }

  if (intent.isPairing) {
    return `🧞 Looking to elevate your meal? I've discovered these wonderful pairings to complement your taste: ${dishNames}. Would you like to add one to your cart?`;
  }

  const highlights = [];
  if (intent.isVeg === true) highlights.push('100% pure vegetarian');
  if (intent.isVeg === false) highlights.push('succulent non-vegetarian');
  if (intent.maxBudget !== null) highlights.push(`under ₹${intent.maxBudget}`);
  if (intent.spicyLevel === 0) highlights.push('mild & comforting');
  if (intent.spicyLevel === 2 || intent.spicyLevel === 3) highlights.push('bold & fiery spicy');

  const highlightText = highlights.length > 0 ? ` with ${highlights.join(', ')}` : '';

  return (
    `🧞 As you wish! I summoned the finest culinary creations matching your request${highlightText}:\n\n` +
    recommendations
      .map(
        (dish, idx) =>
          `**${idx + 1}. ${dish.name}** — ₹${dish.price} • ${dish.isVeg ? '🥬 Veg' : '🍗 Non-Veg'} • ⭐ ${dish.rating}\n` +
          `_${dish.description}_`
      )
      .join('\n\n') +
    `\n\nTap **"➕ Add to Cart"** below to order directly, or let me know if you want drink or dessert pairings!`
  );
};

/**
 * Specialized Cart Pairing Logic
 */
const recommendCartPairings = async (cartItems = []) => {
  const allFoods = await Food.find({ isAvailable: true }).populate('category', 'name slug icon');

  if (!cartItems || cartItems.length === 0) {
    const favorites = allFoods.sort(() => 0.5 - Math.random()).slice(0, 3);
    return {
      recommendations: favorites,
      message: '🧞 Your cart is currently looking a bit lonely! Here are our beloved specials to get you started:',
    };
  }

  const cartFoodIds = cartItems.map((item) => (item.food || item.foodId || item._id)?.toString());
  const cartFoodDocs = allFoods.filter((f) => cartFoodIds.includes(f._id.toString()));
  const cartCategories = new Set(cartFoodDocs.map((f) => f.category?.slug));

  let recommendedCategories = [];

  const hasMains =
    cartCategories.has('artisan-pizza') ||
    cartCategories.has('gourmet-burgers') ||
    cartCategories.has('biryani-bowls') ||
    cartCategories.has('asian-street-wok') ||
    cartCategories.has('south-indian');

  if (hasMains) {
    if (!cartCategories.has('craft-beverages')) recommendedCategories.push('craft-beverages');
    if (!cartCategories.has('desserts-sweets')) recommendedCategories.push('desserts-sweets');
  }

  if (cartCategories.has('healthy-greens')) {
    recommendedCategories.push('craft-beverages');
  }

  if (recommendedCategories.length === 0) {
    recommendedCategories = ['craft-beverages', 'desserts-sweets'];
  }

  const pairings = allFoods
    .filter(
      (f) =>
        recommendedCategories.includes(f.category?.slug) &&
        !cartFoodIds.includes(f._id.toString())
    )
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const finalPairings = pairings.length > 0 ? pairings : allFoods.slice(0, 3);

  return {
    recommendations: finalPairings,
    message: `🧞 To complete your feast, here are the most delightful beverages & desserts that perfectly complement your order:`,
  };
};

/**
 * Detect if user query is seeking food, cravings, recommendations or budget filters
 */
export const isFoodQuery = (message = '', intent = {}) => {
  if (
    intent.isVeg !== null ||
    intent.spicyLevel !== null ||
    intent.maxBudget !== null ||
    (intent.cravingKeywords && intent.cravingKeywords.length > 0) ||
    intent.isSurprise ||
    intent.isPairing
  ) {
    return true;
  }

  const foodTerms = /\b(food|dish|dishes|eat|eating|meal|dinner|lunch|breakfast|brunch|snack|snacks|hungry|starving|crave|craving|cravings|menu|order|ordering|recommend|recommendation|recommendations|suggest|suggestion|suggestions|price|cheap|budget|cost|calories|spicy|mild|sweet|cheesy|crispy|veg|non-veg|vegan|chicken|meat|paneer|biryani|pizza|burger|ramen|noodles|pasta|salad|bowl|dessert|cake|ice\s*cream|drink|beverage|shake|smoothie|soda|coffee|tea|thirst|taste|tasty|delicious|specials|special|dosa|idli|vada|sambar|chutney|podi|parotta|kerala|kaapi|south\s*indian)\b/i;
  return foodTerms.test(message);
};

/**
 * Generate intelligent context-aware quick action pills
 */
export const generateDynamicActions = ({ message = '', intent = {}, cartItems = [], recommendations = [] }) => {
  const q = (message || '').toLowerCase();

  // If cart has items, provide pairing option
  if (cartItems && cartItems.length > 0 && !intent.isPairing) {
    return [
      { label: '🥤 Pair with My Cart', query: 'What drinks or desserts go with my cart?' },
      { label: '🍰 Add Dessert', query: 'Show me sweet desserts' },
      { label: '✨ Surprise Me', query: 'Surprise me with something delicious!' },
    ];
  }

  // South Indian related
  if (
    q.includes('dosa') ||
    q.includes('idli') ||
    q.includes('vada') ||
    q.includes('sambar') ||
    q.includes('south indian') ||
    q.includes('parotta') ||
    q.includes('kerala') ||
    q.includes('kaapi') ||
    q.includes('podi')
  ) {
    return [
      { label: '☕ Filter Kaapi', query: 'Traditional South Indian Filter Kaapi' },
      { label: '🥞 Crispy Ghee Dosa', query: 'Crispy Ghee Podi Roast Dosa' },
      { label: '🍗 Malabar Chicken Curry', query: 'Authentic Malabar Chicken Curry with Parotta' },
    ];
  }

  // Pizza related
  if (q.includes('pizza')) {
    return [
      { label: '🥤 Drink Pairings', query: 'What drinks pair well with pizza?' },
      { label: '🧀 Extra Cheesy', query: 'Show me the cheesiest pizza' },
      { label: '🍰 Sweet Desserts', query: 'Show me sweet desserts' },
    ];
  }

  // Biryani related
  if (q.includes('biryani')) {
    return [
      { label: '🥤 Refreshing Drinks', query: 'Refreshing beverages for biryani' },
      { label: '🌶️ Extra Spicy', query: 'Show me spicy biryani' },
      { label: '🍰 Traditional Sweets', query: 'Desserts to finish my meal' },
    ];
  }

  // Burger related
  if (q.includes('burger')) {
    return [
      { label: '🥤 Craft Shakes', query: 'Best drinks and shakes for burgers' },
      { label: '🍟 Crispy Sides', query: 'Show me crispy sides or snacks' },
      { label: '✨ Surprise Me', query: 'Surprise me with something delicious!' },
    ];
  }

  // Asian / Ramen / Noodles related
  if (q.includes('ramen') || q.includes('noodle') || q.includes('asian') || q.includes('wok')) {
    return [
      { label: '🥤 Cool Drinks', query: 'Cool drinks for spicy noodles' },
      { label: '🥬 Pure Veg Asian', query: 'Vegetarian Asian street food' },
      { label: '💰 Under ₹350', query: 'Asian dishes under 350' },
    ];
  }

  // Healthy / Salad related
  if (q.includes('salad') || q.includes('healthy') || q.includes('diet') || q.includes('calorie')) {
    return [
      { label: '🥤 Fresh Juices', query: 'Healthy fresh beverages' },
      { label: '🥬 Pure Veg Options', query: 'Show me pure veg options' },
      { label: '💰 Under ₹300', query: 'Healthy meals under 300' },
    ];
  }

  // Budget related
  if (intent.maxBudget !== null || q.includes('cheap') || q.includes('budget')) {
    return [
      { label: '⭐ Top Value Dishes', query: 'Highest rated dishes under budget' },
      { label: '🥬 Veg Under Budget', query: 'Pure veg dishes under 300' },
      { label: '✨ Surprise Me', query: 'Surprise me with something delicious!' },
    ];
  }

  // Pure veg
  if (intent.isVeg === true) {
    return [
      { label: '🍕 Veg Sourdough Pizza', query: 'Show me veg artisan pizzas' },
      { label: '🍚 Paneer Biryani', query: 'Royal Shahi Paneer Biryani' },
      { label: '🥗 Fresh Green Bowl', query: 'Healthy clean salad' },
    ];
  }

  // Default / Greetings / Small Talk
  return [
    { label: '✨ Surprise Me', query: 'Surprise me with something delicious!' },
    { label: '🍕 Artisan Pizza', query: 'Recommend a delicious pizza' },
    { label: '🌶️ Spicy Dum Biryani', query: 'Aromatic spicy dum biryani' },
    { label: '💰 Under ₹350', query: 'Show delicious dishes under 350' },
  ];
};

/**
 * Call Google Gemini LLM API when an API key is configured
 */
const callGeminiLLM = async ({ message, history = [], allFoods = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;

  try {
    const menuSummary = allFoods
      .map(
        (f) =>
          `ID:${f._id} | "${f.name}" | Cat:${f.category?.name || 'Main'} | ₹${f.price} | ${f.isVeg ? 'Veg' : 'Non-Veg'} | Spicy:${f.spicyLevel}/3 | Desc:${f.description}`
      )
      .join('\n');

    const systemPrompt = `You are Food Genie 🧞, an intelligent, delightfully charismatic, and helpful culinary AI assistant for the Food Genie food delivery app.

LIVE RESTAURANT MENU (Only recommend items from this list):
${menuSummary}

IMPORTANT CONVERSATIONAL GUIDELINES:
1. ALWAYS respond specifically, directly, and uniquely to what the user said or asked. DO NOT use repetitive canned templates or repeat boilerplate text across different questions.
2. For greetings and small talk (e.g. "hi", "how are you", "who are you", "what's up", "good morning", "what can you do"):
   - Answer conversationally, warmly, and naturally in 1-2 friendly sentences with genuine personality.
   - For "how are you": describe your mood dynamically (e.g., energized, smelling delicious aromas from the tandoor and pizza ovens, feeling magical) and politely ask how they are or what flavors they feel like exploring.
   - NEVER recite or list menu categories (do NOT list "pizzas, biryanis, burgers, Asian wok, healthy greens..."). Speak like a real culinary friend.
   - DO NOT recommend dishes on small talk or greeting queries unless the user actually asks for food, recommendations, or mentions hunger.
3. For food recommendations & cravings (e.g. "suggest a pizza", "I'm hungry", "spicy food under 300", "what's good for dinner", "healthy options"):
   - Recommend 1 to 3 relevant dishes strictly from the LIVE RESTAURANT MENU above.
   - Mention each dish name wrapped in **bold** (e.g., **The Genie Signature Smash Burger**), state its price (e.g., ₹329), and explain in one mouth-watering sentence why it fits their craving.
4. For diet or budget filters:
   - Strictly honor veg / non-veg, spice tolerance, and budget limits.
5. For casual non-food questions, jokes, or compliments:
   - Answer playfully and concisely with a light touch of foodie wit.
6. Tone: Warm, magical, concise, appetizing, and authentic. Never sound robotic.`;

    const contents = [];
    // Convert previous chat history
    history.slice(-4).forEach((h) => {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text || h.content || '' }],
      });
    });
    // Current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    // If preferred model returns 404, fallback to other standard models
    if (!response.ok && response.status === 404) {
      const fallbackModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
      for (const altModel of fallbackModels) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${altModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              },
            }),
          }
        );
        if (response.ok) break;
      }
    }

    if (!response.ok) {
      console.warn('Gemini API call returned non-200, falling back to heuristic engine:', response.status);
      return null;
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.text;

    if (!replyText) return null;

    // Detect mentioned dishes in Gemini's response to attach interactive dish cards
    const matchedDishes = allFoods.filter((f) => {
      const nameRegex = new RegExp(f.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return nameRegex.test(replyText);
    });

    return {
      reply: replyText,
      recommendations: matchedDishes.slice(0, 3),
    };
  } catch (err) {
    console.warn('Gemini LLM error, falling back to heuristic NLU:', err.message);
    return null;
  }
};

/**
 * Main AI Chat Processor
 * Modular architecture: supports both heuristic NLU and Google Gemini LLM
 */
export const aiService = {
  /**
   * Process a conversational food recommendation request
   */
  async processChatMessage({ message, history = [], cartItems = [], userPreferences = {} }) {
    const allFoods = await Food.find({ isAvailable: true }).populate('category', 'name slug icon');

    // 1. Parse natural language intent
    const intent = parseUserIntent(message, userPreferences);

    // 2. Try Google Gemini LLM if API key is provided
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (apiKey) {
      const geminiResult = await callGeminiLLM({ message, history, allFoods });
      if (geminiResult) {
        let finalRecs = [];

        // If Gemini explicitly quoted dish names from menu, attach their cards
        if (geminiResult.recommendations && geminiResult.recommendations.length > 0) {
          finalRecs = geminiResult.recommendations.slice(0, 3);
        } else if (isFoodQuery(message, intent)) {
          // Only if this was a food-seeking request, augment with matching dishes
          const { recommendations } = await recommendDishes(intent, cartItems, 3);
          finalRecs = recommendations;
        }
        // For non-food queries (e.g. "how are you", "hi", small talk), finalRecs remains empty []

        return {
          success: true,
          provider: 'gemini',
          reply: geminiResult.reply,
          recommendations: finalRecs,
          contextParsed: intent,
          suggestedActions: generateDynamicActions({
            message,
            intent,
            cartItems,
            recommendations: finalRecs,
          }),
        };
      }
    }

    // 3. Handle Small Talk ("how are you", "what's up", etc.)
    if (intent.isSmallTalk) {
      const smallTalkReplies = [
        "🧞 I'm feeling magical and full of energy, thank you! The kitchen is bustling and the aroma of fresh dishes is in the air. How are you doing today? Ready to explore something tasty?",
        "🧞 Doing wonderful! Floating on cloud nine and excited to help you find your next craving. How has your day been so far?",
        "🧞 Never better! My culinary senses are tingling and the ovens are hot. What kind of flavors are you in the mood for today?",
      ];
      const reply = smallTalkReplies[Math.floor(Math.random() * smallTalkReplies.length)];

      return {
        success: true,
        provider: 'heuristic',
        reply,
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 4. Handle Greeting intent ("hi", "hello", "hey", etc.)
    if (intent.isPureGreeting) {
      const greetingReplies = [
        "🧞 Hello there! I am Food Genie, your personal AI culinary companion. How can I delight your appetite today?",
        "🧞 Greetings! Welcome to Food Genie. Whether you're starving or just looking for a snack, I'm here to grant your culinary wishes!",
        "🧞 Hello there! Ready for something delicious? Tell me what flavors or cravings you have in mind today!",
      ];
      const reply = greetingReplies[Math.floor(Math.random() * greetingReplies.length)];

      return {
        success: true,
        provider: 'heuristic',
        reply,
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 5. Handle Help / Capabilities intent
    if (intent.isHelp) {
      return {
        success: true,
        provider: 'heuristic',
        reply:
          "🧞 **How I can help you today:**\n\n" +
          "1. **Flavor & Craving Finder**: Ask for *'crispy burger'*, *'cheesy risotto'*, or *'fiery ramen'*.\n" +
          "2. **Strict Dietary Filters**: Specify *'pure veg'* or *'non-veg'* and I'll filter our kitchen accordingly.\n" +
          "3. **Smart Budget Guard**: Tell me *'under ₹300'* or *'budget meal'* to keep your wallet happy.\n" +
          "4. **Meal Pairing Assistant**: Tap *'Pair with my cart'* for perfect drink & dessert suggestions.\n" +
          "5. **1-Click Ordering**: Tap **'➕ Add to Cart'** on any card I recommend to order immediately!\n\n" +
          "What can I summon for you now?",
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 6. Handle Thank You intent
    if (intent.isThanks) {
      return {
        success: true,
        provider: 'heuristic',
        reply:
          "🧞 You are most welcome! It is my pleasure to serve. May every bite be magical and delicious!\n\n" +
          "Whenever you're ready, tap the floating **Cart bar** or **Checkout** to place your feast.",
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 7. Handle Joke intent
    if (intent.isJoke) {
      const jokes = [
        "Why did the tomato blush? Because it saw the salad dressing! 🍅🥗\n\nSpeaking of salads, how about our fresh **Mediterranean Avocado Green Bowl**?",
        "Why don't eggs tell jokes? Because they'd crack each other up! 🥚😂\n\nCan I tempt you with our sizzling hot **Asian Street Wok Noodles**?",
        "What do you call a fake noodle? An impasta! 🍝✨\n\nOur **Truffle Mushroom Sourdough Pizza** is 100% authentic though!",
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        success: true,
        provider: 'heuristic',
        reply: `🧞 ${joke}`,
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 8. Handle cart pairing intent
    if (intent.isPairing && cartItems.length > 0) {
      const pairingResult = await recommendCartPairings(cartItems);
      return {
        success: true,
        provider: 'heuristic',
        reply:
          `${pairingResult.message}\n\n` +
          pairingResult.recommendations
            .map((d, i) => `**${i + 1}. ${d.name}** (₹${d.price}) — _${d.description}_`)
            .join('\n\n'),
        recommendations: pairingResult.recommendations,
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems, recommendations: pairingResult.recommendations }),
      };
    }

    // 9. If NOT a food query and none of the conversational intents above matched:
    if (!isFoodQuery(message, intent)) {
      return {
        success: true,
        provider: 'heuristic',
        reply:
          "🧞 I am your Food Genie! While my magical powers are greatest when finding mouth-watering dishes, pizzas, biryanis, and drink pairings, I'm always here to help you order.\n\n" +
          "What kind of meal or flavors are you in the mood for today?",
        recommendations: [],
        contextParsed: intent,
        suggestedActions: generateDynamicActions({ message, intent, cartItems }),
      };
    }

    // 10. Retrieve and score dishes from database for food-seeking queries
    const { recommendations } = await recommendDishes(intent, cartItems, 3);

    // 11. Generate conversational Genie speech
    const speech = generateGenieSpeech(intent, recommendations);

    return {
      success: true,
      provider: 'heuristic',
      reply: speech,
      recommendations,
      contextParsed: intent,
      suggestedActions: generateDynamicActions({ message, intent, cartItems, recommendations }),
    };
  },

  /**
   * Specialized pairing recommendations based on active cart
   */
  async getCartPairings(cartItems = []) {
    return await recommendCartPairings(cartItems);
  },

  /**
   * Quick inspiration prompt suggestions for the chat welcome screen
   */
  getQuickSuggestions() {
    return [
      { id: 'cheesy', label: '🍕 Cheesy Comfort Food', query: 'I want something cheesy and comforting' },
      { id: 'south-indian', label: '🥞 Crispy Ghee Dosa', query: 'Crispy South Indian dosa or fluffy idli' },
      { id: 'healthy', label: '🥗 Fresh & Healthy Salad', query: 'Healthy clean meal under 400 calories' },
      { id: 'spicy', label: '🌶️ Spicy Dum Biryani', query: 'Aromatic spicy dum biryani for dinner' },
      { id: 'budget', label: '💰 Dinner Under ₹350', query: 'Best dinner options under ₹350' },
      { id: 'sweet', label: '🍰 Decadent Chocolate Dessert', query: 'Sweet chocolate dessert to treat myself' },
      { id: 'asian', label: '🍜 Sizzling Asian Noodles', query: 'Authentic wok-tossed noodles or ramen' },
    ];
  },
};

export default aiService;
