const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/meal-plans
// @desc    Get all meal plans for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const plans = await MealPlan.find({ user: req.user._id })
      .select('name isActive tags createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal plans' });
  }
});

// @route   GET /api/meal-plans/:id
// @desc    Get a specific meal plan
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const plan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal plan' });
  }
});

// @route   POST /api/meal-plans
// @desc    Create a new meal plan
// @access  Private
router.post('/', async (req, res) => {
  const { name, days, groceryItems, tags } = req.body;
  try {
    const plan = await MealPlan.create({
      user: req.user._id,
      name: name || 'My Weekly Plan',
      days: days || [],
      groceryItems: groceryItems || [],
      tags: tags || [],
    });
    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Error creating meal plan' });
  }
});

// @route   PUT /api/meal-plans/:id
// @desc    Update a meal plan
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating meal plan' });
  }
});

// @route   DELETE /api/meal-plans/:id
// @desc    Delete a meal plan
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    res.json({ success: true, message: 'Meal plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal plan' });
  }
});

module.exports = router;
