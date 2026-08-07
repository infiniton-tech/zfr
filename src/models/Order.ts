import mongoose, { Schema, type Document } from "mongoose";
import type { IOrder } from "@/types";

export interface IOrderDocument extends Omit<IOrder, "_id" | "createdAt" | "updatedAt">, Document {}

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "User", required: false, index: true },
    // Guest contact details (also filled for logged-in users for a consistent admin view)
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String, required: true },
    items: [CartItemSchema],
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: true },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod", "online", "card"], default: "card" },
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
