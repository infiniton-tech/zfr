import mongoose, { Schema, type Document } from "mongoose";
import type { IHeroSection } from "@/types";

export interface IHeroSectionDocument extends Omit<IHeroSection, "_id" | "createdAt" | "updatedAt">, Document {}

const HeroSectionSchema = new Schema<IHeroSectionDocument>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    leftImage: { type: String },
    rightImage: { type: String },
    ctaText: { type: String, default: "VIEW NOW" },
    ctaLink: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    gender: { type: String, enum: ["woman", "man", "kids", "unisex"], required: true, index: true },
  },
  { timestamps: true }
);

HeroSectionSchema.index({ gender: 1, isActive: 1, sortOrder: 1 });

export const HeroSection = mongoose.models.HeroSection || mongoose.model<IHeroSectionDocument>("HeroSection", HeroSectionSchema);
