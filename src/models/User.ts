import mongoose, { Schema, type Document } from "mongoose";
import type { IUser } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id" | "createdAt" | "updatedAt">, Document {}

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
