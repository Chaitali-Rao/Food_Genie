import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide dish name'],
      trim: true,
      maxlength: [100, 'Dish name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide dish description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a food category'],
    },
    image: {
      type: String,
      required: [true, 'Please provide dish image URL'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    spicyLevel: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: Mild, 1: Medium, 2: Hot, 3: Extra Hot
      default: 1,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 24,
    },
    prepTimeMinutes: {
      type: Number,
      default: 25,
      min: 5,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    calories: {
      type: Number,
      default: 400,
    },
    ingredients: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for fast keyword search on dish name and description
foodSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Food = mongoose.model('Food', foodSchema);
export default Food;

