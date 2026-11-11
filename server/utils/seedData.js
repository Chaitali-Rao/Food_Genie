import Category from '../models/Category.js';
import Food from '../models/Food.js';

export const initialCategories = [
  {
    name: 'Artisan Pizza',
    slug: 'artisan-pizza',
    icon: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    description: 'Wood-fired sourdough pizzas with artisanal toppings',
  },
  {
    name: 'Gourmet Burgers',
    slug: 'gourmet-burgers',
    icon: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Juicy handcrafted brioche burgers and crispy sides',
  },
  {
    name: 'Biryani & Rice Bowls',
    slug: 'biryani-bowls',
    icon: '🍛',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    description: 'Aromatic dum biryanis and flavorful spiced rice bowls',
  },
  {
    name: 'Asian Street Wok',
    slug: 'asian-street-wok',
    icon: '🍜',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    description: 'Authentic ramen, wok-tossed noodles and pan-fried dumplings',
  },
  {
    name: 'South Indian Classics',
    slug: 'south-indian',
    icon: '🥘',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    description: 'Crispy ghee dosas, fluffy steamed idlis, medu vadas & coastal curries',
  },
  {
    name: 'Healthy Greens & Bowls',
    slug: 'healthy-greens',
    icon: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    description: 'Nutritious farm-fresh salads, protein bowls & smoothies',
  },
  {
    name: 'Desserts & Sweets',
    slug: 'desserts-sweets',
    icon: '🍰',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    description: 'Decadent chocolate cakes, pastries and artisanal gelato',
  },
  {
    name: 'Craft Beverages',
    slug: 'craft-beverages',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80',
    description: 'Fresh pressed juices, mocktails and iced brewed teas',
  },
];

export const getInitialFoods = (categoryMap) => [
  // Pizza
  {
    name: 'Truffle Mushroom & Mozzarella Pizza',
    description: 'Wood-fired crust topped with wild forest mushrooms, buffalo mozzarella, white truffle oil and fresh thyme.',
    price: 389,
    category: categoryMap['artisan-pizza'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.8,
    numReviews: 124,
    prepTimeMinutes: 20,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'chef-special', 'vegetarian'],
    calories: 680,
    ingredients: ['Wild Mushrooms', 'Buffalo Mozzarella', 'Truffle Oil', 'Sourdough Crust', 'Fresh Thyme'],
  },
  {
    name: 'Fiery Pepperoni & Hot Honey Pizza',
    description: 'Smoked pepperoni slices with spicy marinara, crushed chili flakes, and a drizzle of organic hot chili honey.',
    price: 429,
    category: categoryMap['artisan-pizza'],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    spicyLevel: 2,
    rating: 4.9,
    numReviews: 188,
    prepTimeMinutes: 22,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'spicy', 'trending'],
    calories: 780,
    ingredients: ['Smoked Pepperoni', 'San Marzano Marinara', 'Hot Honey', 'Mozzarella', 'Chili Flakes'],
  },
  {
    name: 'Classic Margherita Classica',
    description: 'San Marzano tomato base, fresh fior di latte mozzarella, basil leaves and extra virgin olive oil.',
    price: 299,
    category: categoryMap['artisan-pizza'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.7,
    numReviews: 95,
    prepTimeMinutes: 18,
    isAvailable: true,
    isFeatured: false,
    tags: ['classic', 'italian', 'vegetarian'],
    calories: 550,
    ingredients: ['San Marzano Tomatoes', 'Fresh Mozzarella', 'Basil', 'Extra Virgin Olive Oil'],
  },

  // Burgers
  {
    name: 'The Genie Signature Smash Burger',
    description: 'Double smashed beef/chicken patty, melted vintage cheddar, caramelised onions, pickles & secret Genie burger sauce.',
    price: 329,
    category: categoryMap['gourmet-burgers'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    spicyLevel: 1,
    rating: 4.9,
    numReviews: 210,
    prepTimeMinutes: 15,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'signature'],
    calories: 720,
    ingredients: ['Double Patty', 'Brioche Bun', 'Vintage Cheddar', 'Genie Sauce', 'Pickles'],
  },
  {
    name: 'Crispy Paneer & Jalapeño Crunch Burger',
    description: 'Herbed panko-crusted cottage cheese patty topped with spicy jalapeño slaw and smoky chipotle mayo.',
    price: 279,
    category: categoryMap['gourmet-burgers'],
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 2,
    rating: 4.6,
    numReviews: 84,
    prepTimeMinutes: 15,
    isAvailable: true,
    isFeatured: false,
    tags: ['crispy', 'spicy', 'vegetarian'],
    calories: 610,
    ingredients: ['Panko Cottage Cheese', 'Jalapeño Slaw', 'Chipotle Mayo', 'Lettuce', 'Toasted Bun'],
  },

  // Biryani
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Slow-cooked fragrant long-grain basmati rice layered with tender marinated chicken, saffron, mint and fried onions. Served with mirchi ka salan.',
    price: 369,
    category: categoryMap['biryani-bowls'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    spicyLevel: 2,
    rating: 4.9,
    numReviews: 340,
    prepTimeMinutes: 25,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'traditional', 'spiced'],
    calories: 750,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Brown Onions', 'Ghee', 'Whole Spices'],
  },
  {
    name: 'Royal Shahi Paneer Tikka Biryani',
    description: 'Clay-oven charred paneer cubes layered with aromatic basmati rice, cashews, raisins, and royal saffron gravy.',
    price: 319,
    category: categoryMap['biryani-bowls'],
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 1,
    rating: 4.7,
    numReviews: 142,
    prepTimeMinutes: 20,
    isAvailable: true,
    isFeatured: false,
    tags: ['royal', 'vegetarian', 'mild'],
    calories: 660,
    ingredients: ['Tandoori Paneer', 'Basmati Rice', 'Cashews', 'Saffron', 'Mint & Raita'],
  },

  // Asian
  {
    name: 'Tokyo Tonkotsu Style Ramen Bowl',
    description: 'Rich, 12-hour savory broth served with handmade ramen noodles, bamboo shoots, soft-boiled ajitsuke egg, nori and scallions.',
    price: 349,
    category: categoryMap['asian-street-wok'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    spicyLevel: 1,
    rating: 4.8,
    numReviews: 165,
    prepTimeMinutes: 20,
    isAvailable: true,
    isFeatured: true,
    tags: ['japanese', 'comfort-food'],
    calories: 590,
    ingredients: ['Ramen Noodles', 'Savory Broth', 'Ajitsuke Egg', 'Bamboo Shoots', 'Nori Seaweed'],
  },
  {
    name: 'Spicy Dan Dan Chili Garlic Noodles',
    description: 'Wheat noodles tossed in a fiery Sichuan chili oil, roasted sesame paste, crushed peanuts, bok choy and crispy tofu.',
    price: 299,
    category: categoryMap['asian-street-wok'],
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 3,
    rating: 4.7,
    numReviews: 112,
    prepTimeMinutes: 18,
    isAvailable: true,
    isFeatured: false,
    tags: ['sichuan', 'spicy', 'vegetarian'],
    calories: 520,
    ingredients: ['Wheat Noodles', 'Sichuan Chili Oil', 'Sesame Paste', 'Crushed Peanuts', 'Bok Choy'],
  },

  // South Indian Classics
  {
    name: 'Crispy Ghee Podi Roast Dosa',
    description: 'Golden paper-thin fermented rice crepe roasted in aromatic desi ghee, layered with spicy gunpowder podi, served with creamy coconut chutney, tomato chutney & hot drumstick sambar.',
    price: 189,
    category: categoryMap['south-indian'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 2,
    rating: 4.9,
    numReviews: 245,
    prepTimeMinutes: 15,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'south-indian', 'ghee-roast', 'crispy', 'vegetarian'],
    calories: 380,
    ingredients: ['Fermented Rice-Lentil Batter', 'Desi Ghee', 'Gunpowder Spiced Podi', 'Coconut Chutney', 'Drumstick Sambar'],
  },
  {
    name: 'Steamed Button Idlis & Medu Vada Platter',
    description: 'Trio of melt-in-mouth fluffy steamed rice cakes and a golden crunchy urad dal medu vada, accompanied by traditional spiced lentil sambar and fresh coconut-mint relish.',
    price: 159,
    category: categoryMap['south-indian'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 1,
    rating: 4.8,
    numReviews: 180,
    prepTimeMinutes: 12,
    isAvailable: true,
    isFeatured: false,
    tags: ['comfort-food', 'breakfast', 'vegetarian', 'traditional'],
    calories: 320,
    ingredients: ['Steamed Rice Idlis', 'Crispy Medu Vada', 'Lentil Vegetable Sambar', 'Coconut Mint Chutney'],
  },
  {
    name: 'Mysore Masala Butter Dosa',
    description: 'Crispy golden crepe smeared with zesty fiery red garlic-chili chutney, stuffed with comforting spiced potato mash, and finished with melting white butter.',
    price: 219,
    category: categoryMap['south-indian'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 2,
    rating: 4.8,
    numReviews: 135,
    prepTimeMinutes: 15,
    isAvailable: true,
    isFeatured: true,
    tags: ['mysore-classic', 'butter-dosa', 'vegetarian', 'spicy'],
    calories: 420,
    ingredients: ['Dosa Batter', 'Spiced Potato Masala', 'Red Garlic Chutney', 'Fresh Butter', 'Sambar'],
  },
  {
    name: 'Authentic Malabar Chicken Curry & Flaky Parotta',
    description: 'Succulent chicken pieces simmered in a luscious roasted coconut, curry leaf, and black pepper Kerala gravy, served with two flaky layered parottas.',
    price: 349,
    category: categoryMap['south-indian'],
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800&auto=format&fit=crop&q=80',
    isVeg: false,
    spicyLevel: 2,
    rating: 4.9,
    numReviews: 295,
    prepTimeMinutes: 20,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'kerala-special', 'chef-special', 'non-veg'],
    calories: 690,
    ingredients: ['Tender Chicken', 'Roasted Coconut Gravy', 'Curry Leaves', 'Kerala Spices', 'Flaky Parotta'],
  },

  // Healthy
  {
    name: 'Mediterranean Avocado & Quinoa Bowl',
    description: 'Nutrient-rich bowl with tricolor quinoa, Hass avocado, cherry tomatoes, cucumbers, kalamata olives, feta cheese and lemon-herb vinaigrette.',
    price: 289,
    category: categoryMap['healthy-greens'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.7,
    numReviews: 76,
    prepTimeMinutes: 12,
    isAvailable: true,
    isFeatured: false,
    tags: ['superfood', 'high-fiber', 'vegetarian'],
    calories: 390,
    ingredients: ['Tricolor Quinoa', 'Hass Avocado', 'Feta Cheese', 'Kalamata Olives', 'Lemon Vinaigrette'],
  },

  // Desserts
  {
    name: 'Molten Belgian Dark Chocolate Lava Cake',
    description: 'Warm chocolate cake with a decadent flowing dark chocolate core, served with a scoop of Madagascar vanilla bean gelato.',
    price: 199,
    category: categoryMap['desserts-sweets'],
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.9,
    numReviews: 290,
    prepTimeMinutes: 12,
    isAvailable: true,
    isFeatured: true,
    tags: ['bestseller', 'indulgent'],
    calories: 480,
    ingredients: ['Belgian Dark Chocolate', 'Butter', 'Cocoa', 'Vanilla Bean Gelato'],
  },

  // Beverages
  {
    name: 'Passionfruit Mint Cooler Fizz',
    description: 'Sparkling cooler infused with fresh passion fruit pulp, crushed garden mint, lime juice and organic agave nectar.',
    price: 149,
    category: categoryMap['craft-beverages'],
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.6,
    numReviews: 64,
    prepTimeMinutes: 5,
    isAvailable: true,
    isFeatured: false,
    tags: ['refreshing', 'mocktail'],
    calories: 110,
    ingredients: ['Passionfruit', 'Fresh Mint', 'Sparkling Soda', 'Lime Juice', 'Agave'],
  },
  {
    name: 'Traditional South Indian Filter Kaapi',
    description: 'Frothy, full-bodied authentic South Indian filter coffee brewed from freshly roasted chicory-blended beans and hot whole milk, served in traditional brass davarah.',
    price: 89,
    category: categoryMap['craft-beverages'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    isVeg: true,
    spicyLevel: 0,
    rating: 4.9,
    numReviews: 310,
    prepTimeMinutes: 5,
    isAvailable: true,
    isFeatured: true,
    tags: ['traditional', 'filter-coffee', 'kaapi', 'hot-beverage', 'bestseller'],
    calories: 85,
    ingredients: ['Plantation Peaberry & Chicory Beans', 'Boiled Whole Milk', 'Organic Sugar'],
  },
];

/**
 * Seed database with initial categories and dishes if empty or forced.
 */
export const seedDatabase = async (force = false) => {
  try {
    const categoryCount = await Category.countDocuments();
    const foodCount = await Food.countDocuments();

    if (categoryCount > 0 && foodCount > 0 && !force) {
      return { seeded: false, message: 'Database already populated with food catalog' };
    }

    if (force) {
      await Food.deleteMany({});
      await Category.deleteMany({});
    }

    // Insert categories
    const createdCategories = await Category.insertMany(initialCategories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Insert foods
    const foodsToInsert = getInitialFoods(categoryMap);
    const createdFoods = await Food.insertMany(foodsToInsert);

    console.log(`[Seed Success] Populated ${createdCategories.length} categories and ${createdFoods.length} dishes.`);
    return {
      seeded: true,
      categoriesCount: createdCategories.length,
      foodsCount: createdFoods.length,
    };
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    throw error;
  }
};

