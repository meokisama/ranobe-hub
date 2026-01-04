const mongoose = require("mongoose");

const PublisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes để tối ưu queries
PublisherSchema.index({ name: 1 });

module.exports = mongoose.model("Publisher", PublisherSchema);
