const mongoose = require('mongoose');

// Quantity sub-document
const quantitySchema = new mongoose.Schema(
  {
    key: String,   // e.g. 'chapati', 'rice'
    value: Number, // e.g. 6
  },
  { _id: false }
);

// Single day's data
const dayDataSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    Breakfast: { type: String, default: '' },
    Lunch: { type: String, default: '' },
    Dinner: { type: String, default: '' },
    note: { type: String, default: '' },
    // Quantities: { mealName: [{ key, value }] }
    quantities: {
      type: Map,
      of: [quantitySchema],
      default: {},
    },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      default: 'My Weekly Plan',
    },
    days: {
      type: [dayDataSchema],
      default: [],
    },
    groceryItems: {
      type: [
        {
          name: String,
          qty: String,
          checked: Boolean,
          id: Number,
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: false, // The currently loaded plan
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active plan per user
mealPlanSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
