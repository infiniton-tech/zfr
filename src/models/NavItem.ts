import mongoose, { Schema, type Document } from "mongoose";
import type { INavItem } from "@/types";

export interface INavItemDocument extends Omit<INavItem, "_id" | "createdAt" | "updatedAt">, Document {}

const NavItemSchema = new Schema<INavItemDocument>(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    position: { type: String, enum: ["header-main", "header-secondary", "sidebar", "footer"], required: true, default: "header-main" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NavItemSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

export const NavItem = mongoose.models.NavItem || mongoose.model<INavItemDocument>("NavItem", NavItemSchema);
