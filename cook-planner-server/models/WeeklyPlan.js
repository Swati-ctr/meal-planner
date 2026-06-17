const mongoose = require('mongoose');

const weeklyPlanSchema = new mongoose.Schema(
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
      default: 'Weekly Plan',
    },
    // Full snapshot of the menu data (day -> meal mappings)
    menuData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Grocery list snapshot
    groceryItems: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // Whether this is the currently active plan
    isActive: {
      type: Boolean,
      default: false,
    },
    // Notes / description
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

weeklyPlanSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WeeklyPlan', weeklyPlanSchema);
