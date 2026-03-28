const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['javascript', 'python', 'c', 'cpp', 'java'],
      default: 'javascript',
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      default: '',
    },
    stdin: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Third argument forces Mongoose to use 'codesync' collection (not auto-generated 'snippets')
module.exports = mongoose.model('Snippet', SnippetSchema, 'codesync');
