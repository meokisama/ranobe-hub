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

// name đã có unique index tự động → không cần khai báo index thêm

export default mongoose.model<IPublisher>("Publisher", PublisherSchema);
