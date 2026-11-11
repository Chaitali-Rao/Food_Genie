import Food from '../models/Food.js';
import Category from '../models/Category.js';

/**
 * @desc    Get all foods with search, filtering, sorting, and pagination
 * @route   GET /api/foods
 * @access  Public
 */
export const getFoods = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isVeg,
      spicyLevel,
      minPrice,
      maxPrice,
      isFeatured,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isAvailable: true };

    // Text search query across name, description, tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Category filter by Slug or Category ObjectId
    if (category && category !== 'all') {
      const foundCategory = await Category.findOne({
        $or: [
          { slug: category.toLowerCase().trim() },
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
        ],
      });

      if (foundCategory) {
        query.category = foundCategory._id;
      }
    }

    // Dietary Filter: Veg vs Non-Veg
    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true' || isVeg === true;
    }

    // Spicy Level Filter
    if (spicyLevel !== undefined && spicyLevel !== '') {
      query.spicyLevel = Number(spicyLevel);
    }

    // Featured only
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { isFeatured: -1, rating: -1, createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1, numReviews: -1 };
    } else if (sort === 'prep-time') {
      sortOptions = { prepTimeMinutes: 1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const totalCount = await Food.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    const foods = await Food.find(query)
      .populate('category', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: foods.length,
      totalCount,
      totalPages,
      currentPage: pageNum,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single food item by ID
 * @route   GET /api/foods/:id
 * @access  Public
 */
export const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food item identifier',
      });
    }

    const food = await Food.findById(id).populate('category', 'name slug icon description');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active categories
 * @route   GET /api/foods/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Aggregate food item count per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const itemCount = await Food.countDocuments({ category: cat._id, isAvailable: true });
        return {
          ...cat.toObject(),
          itemCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new food item
 * @route   POST /api/foods
 * @access  Private/Admin
 */
export const createFood = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isVeg = true,
      spicyLevel = 0,
      prepTimeMinutes = 20,
      isFeatured = false,
      tags = [],
      calories = 350,
      ingredients = [],
    } = req.body;

    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category, and image URL',
      });
    }

    const food = await Food.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image,
      isVeg: Boolean(isVeg),
      spicyLevel: Number(spicyLevel),
      prepTimeMinutes: Number(prepTimeMinutes),
      isFeatured: Boolean(isFeatured),
      tags,
      calories: Number(calories),
      ingredients,
    });

    const populatedFood = await Food.findById(food._id).populate('category', 'name slug icon');

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      food: populatedFood,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a food item
 * @route   PUT /api/foods/:id
 * @access  Private/Admin
 */
export const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug icon');

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a food item
 * @route   DELETE /api/foods/:id
 * @access  Private/Admin
 */
export const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    await Food.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

