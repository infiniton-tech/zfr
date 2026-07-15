import mongoose, { Schema, type Document } from "mongoose";

export interface ITrendingItem {
  _id?: string;
  name: string;
  image: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrendingItemDocument extends Omit<ITrendingItem, "_id" | "createdAt" | "updatedAt">, Document {}

const TrendingItemSchema = new Schema<ITrendingItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    ctaLink: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TrendingItemSchema.index({ isActive: 1, sortOrder: 1 });

export const TrendingItem =
  mongoose.models.TrendingItem ||
  mongoose.model<ITrendingItemDocument>("TrendingItem", TrendingItemSchema);
