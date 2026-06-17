const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },

    // Cook Profile — for WhatsApp sharing
    cookName: {
      type: String,
      trim: true,
      default: '',
    },
    cookPhone: {
      type: String,
      trim: true,
      default: '',
    },

    // Allergy & Dietary Preferences
    allergies: {
      type: [String],
      default: [],
      // e.g. ['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy']
    },
    dietaryPreferences: {
      type: [String],
      default: [],
      // e.g. ['vegetarian', 'vegan', 'jain', 'no-onion-garlic']
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
