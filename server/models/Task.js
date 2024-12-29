const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'health', 'other'],
    default: 'other'
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  isStarred: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Индексы
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ text: 'text', description: 'text' });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ isStarred: 1 });

module.exports = mongoose.model('Task', taskSchema); 