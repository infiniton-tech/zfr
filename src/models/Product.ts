import mongoose, { Schema, type Document } from "mongoose";
import type { IProduct } from "@/types";

export interface IProductDocument extends Omit<IProduct, "_id" | "createdAt" | "updatedAt">, Document {}

const ProductColorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String },
  },
  { _id: false }
);

const ProductSizeSchema = new Schema(
  {
    name: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
    images: [{ type: String, required: true }],
    colors: [ProductColorSchema],
    sizes: [ProductSizeSchema],
    tags: [{ type: String }],
    materials: [{ type: String }],
    careInstructions: { type: String },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    gender: { type: String, enum: ["woman", "man", "kids", "unisex"], required: true, index: true },
    stockQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ gender: 1, categoryIds: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ isNew: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
