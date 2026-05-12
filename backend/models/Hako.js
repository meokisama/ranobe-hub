import mongoose from "mongoose";

const HakoSchema = new mongoose.Schema({
  hakoId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
  },
  uploader: {
    type: String,
    default: "",
  },
  translator: {
    type: String,
    default: "",
  },
  lastUpdated: {
    type: Date,
  },
  epub: {
    type: String,
    default: null,
  },
  pdf: {
    type: String,
    default: null,
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
HakoSchema.index({ name: 1 });
HakoSchema.index({ uploader: 1 });
HakoSchema.index({ translator: 1 });
HakoSchema.index({ lastUpdated: -1 });
HakoSchema.index({ createdAt: -1 });

export default mongoose.model("Hako", HakoSchema);
