import mongoose, { Schema, type Document } from "mongoose";

export interface IHako extends Document {
  hakoId?: string;
  name: string;
  uploader: string;
  translator: string;
  lastUpdated?: Date | null;
  epub?: string | null;
  pdf?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const HakoSchema = new Schema<IHako>(
  {
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
  },
  { timestamps: true },
);

// Indexes for query optimization (hakoId already gets a unique index automatically)
HakoSchema.index({ name: 1 });
HakoSchema.index({ uploader: 1 });
HakoSchema.index({ translator: 1 });
HakoSchema.index({ lastUpdated: -1 });
HakoSchema.index({ createdAt: -1 });

export default mongoose.model<IHako>("Hako", HakoSchema);
