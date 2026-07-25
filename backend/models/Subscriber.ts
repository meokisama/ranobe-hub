import mongoose, { Schema, type Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
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
  },
  { timestamps: true },
);

// Indexes for query optimization (email already gets a unique index automatically)
subscriberSchema.index({ isActive: 1 });

export default mongoose.model<ISubscriber>("Subscriber", subscriberSchema);
