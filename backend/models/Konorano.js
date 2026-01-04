const mongoose = require("mongoose");

const KonoranoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    default: "宝島社",
    required: true,
  },
  coverImage: {
    type: String,
    default: "default-cover.jpg",
  },
  filePath: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  viURL: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Konorano", KonoranoSchema);
