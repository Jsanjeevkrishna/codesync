const mongoose = require('mongoose');

const ExtensionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Extension name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    // The script is a JS function body (string) that receives `code` and returns transformed `code`
    // Example: "return code.toUpperCase();"
    script: {
      type: String,
      required: [true, 'Script is required'],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Extension', ExtensionSchema);
