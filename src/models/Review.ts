import mongoose, { Schema, type Document } from "mongoose";

export interface IReviewDocument extends Document {
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReviewDocument>("Review", ReviewSchema);
