const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  portfolio: [portfolioItemSchema],
  settings: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'ru'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 