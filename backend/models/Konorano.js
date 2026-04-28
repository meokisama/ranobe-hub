import mongoose from "mongoose";

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

// Indexes để tối ưu queries
KonoranoSchema.index({ name: 1 });
KonoranoSchema.index({ author: 1 });
KonoranoSchema.index({ createdAt: -1 });
KonoranoSchema.index({ releaseDate: -1 });

export default mongoose.model("Konorano", KonoranoSchema);
