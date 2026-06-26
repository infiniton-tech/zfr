import mongoose, { Schema, type Document } from "mongoose";
import type { ILook } from "@/types";

export interface ILookDocument extends Omit<ILook, "_id" | "createdAt" | "updatedAt">, Document {}

const LookSchema = new Schema<ILookDocument>(
  {
    image: { type: String, required: true },
    userName: { type: String, trim: true },
    caption: { type: String, trim: true },
    instagramHandle: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LookSchema.index({ isFeatured: 1, approved: 1 });

export const Look = mongoose.models.Look || mongoose.model<ILookDocument>("Look", LookSchema);
