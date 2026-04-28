import mongoose from "mongoose";

const EbookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
  },
  illustrator: {
    type: String,
    default: "Unknown",
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
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher",
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
EbookSchema.index({ name: 1 });
EbookSchema.index({ author: 1 });
EbookSchema.index({ publisher: 1 });
EbookSchema.index({ createdAt: -1 });
EbookSchema.index({ releaseDate: -1 });

export default mongoose.model("Ebook", EbookSchema);
