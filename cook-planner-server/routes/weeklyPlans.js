const express = require('express');
const router = express.Router();
const WeeklyPlan = require('../models/WeeklyPlan');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/weekly-plans
// @desc    Get all saved weekly plans for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const plans = await WeeklyPlan.find({ user: req.user._id })
      .select('name description isActive createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly plans' });
  }
});

// @route   GET /api/weekly-plans/active
// @desc    Get currently active weekly plan
// @access  Private
router.get('/active', async (req, res) => {
  try {
    const plan = await WeeklyPlan.findOne({ user: req.user._id, isActive: true });
    res.json({ success: true, plan: plan || null });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active plan' });
  }
});

// @route   GET /api/weekly-plans/:id
// @desc    Get a specific weekly plan (full data)
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const plan = await WeeklyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan' });
  }
});

// @route   POST /api/weekly-plans
// @desc    Save a new weekly plan
// @access  Private
router.post('/', async (req, res) => {
  console.log(req.body)
  console.log("POST /weekly-plans BODY:", req.body)
  console.log("SAVE HIT:", req.body)
  const { name, menuData, groceryItems, description } = req.body;
  try {
    const plan = await WeeklyPlan.create({
      user: req.user._id,
      name: name || 'Weekly Plan',
      menuData: menuData || {},
      groceryItems: groceryItems || [],
      description: description || '',
    });
    console.log("SAVED PLAN ID:", plan._id)

    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error('Save plan error:', error);
    res.status(500).json({ message: 'Error saving weekly plan' });
  }
});

router.put("/active", async (req, res) => {
  const userId = req.user.id

  const updated = await WeeklyPlan.findOneAndUpdate(
    { userId },
    { menuData: req.body.menuData },
    { new: true, upsert: true }
  )

  res.json({ plan: updated })
})

// @route   PUT /api/weekly-plans/:id
// @desc    Update / overwrite a weekly plan
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan' });
  }
});

// @route   PUT /api/weekly-plans/:id/rename
// @desc    Rename a weekly plan
// @access  Private
router.put('/:id/rename', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  try {
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name: name.trim() },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error renaming plan' });
  }
});

// @route   POST /api/weekly-plans/:id/duplicate
// @desc    Duplicate a weekly plan
// @access  Private
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await WeeklyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) return res.status(404).json({ message: 'Plan not found' });

    const copy = await WeeklyPlan.create({
      user: req.user._id,
      name: `${original.name} (Copy)`,
      menuData: original.menuData,
      groceryItems: original.groceryItems,
      description: original.description,
      isActive: false,
    });

    res.status(201).json({ success: true, plan: copy });
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating plan' });
  }
});

// @route   PUT /api/weekly-plans/:id/activate
// @desc    Set a plan as the active (loaded) plan
// @access  Private
router.put('/:id/activate', async (req, res) => {
  try {
    // Deactivate all other plans
    await WeeklyPlan.updateMany({ user: req.user._id }, { isActive: false });

    // Activate selected plan
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: true },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: 'Error activating plan' });
  }
});

// @route   DELETE /api/weekly-plans/:id
// @desc    Delete a weekly plan
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const plan = await WeeklyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan' });
  }
});

module.exports = router;
