import mongoose, { Schema, type Document } from "mongoose";

export interface IPublisher extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const PublisherSchema = new Schema<IPublisher>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

// name already gets a unique index automatically, so no extra index is needed

export default mongoose.model<IPublisher>("Publisher", PublisherSchema);
