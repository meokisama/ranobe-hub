const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes để tối ưu queries
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });

module.exports = mongoose.model("Subscriber", subscriberSchema);
