import mongoose, { Schema, type Document } from "mongoose";
import type { ICategory } from "@/types";

export interface ICategoryDocument extends Omit<ICategory, "_id" | "createdAt" | "updatedAt">, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    gender: { type: String, enum: ["woman", "man", "kids", "unisex"], required: true, index: true },
    image: { type: String },
    description: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ gender: 1, parentId: 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);
