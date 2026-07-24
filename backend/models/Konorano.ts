import mongoose, { Schema, type Document } from "mongoose";

export interface IKonorano extends Document {
  name: string;
  author: string;
  coverImage: string;
  filePath: string;
  releaseDate: Date;
  viURL: string;
  createdAt: Date;
  updatedAt: Date;
}

const KonoranoSchema = new Schema<IKonorano>(
  {
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
  },
  { timestamps: true },
);

// Indexes để tối ưu queries (name đã có unique index tự động)
KonoranoSchema.index({ author: 1 });
KonoranoSchema.index({ createdAt: -1 });
KonoranoSchema.index({ releaseDate: -1 });

export default mongoose.model<IKonorano>("Konorano", KonoranoSchema);
