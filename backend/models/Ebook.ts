import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IEbook extends Document {
  name: string;
  author: string;
  illustrator: string;
  coverImage: string;
  filePath: string;
  releaseDate: Date;
  publisher: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EbookSchema = new Schema<IEbook>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes for query optimization (name already gets a unique index automatically)
EbookSchema.index({ author: 1 });
EbookSchema.index({ publisher: 1 });
EbookSchema.index({ createdAt: -1 });
EbookSchema.index({ releaseDate: -1 });

export default mongoose.model<IEbook>("Ebook", EbookSchema);
