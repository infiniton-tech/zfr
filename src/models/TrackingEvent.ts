import mongoose, { Schema, type Document } from "mongoose";

export interface ITrackingEventDocument extends Document {
  visitorId: string;
  userId?: string;
  eventType: string; // 'product_view', 'product_click', 'wishlist_add', 'wishlist_remove', 'cart_add', 'cart_remove', 'checkout_start', 'purchase'
  productId?: string;
  url?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const TrackingEventSchema = new Schema<ITrackingEventDocument>(
  {
    visitorId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "User", index: true },
    eventType: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "Product", index: true },
    url: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const TrackingEvent = mongoose.models.TrackingEvent || mongoose.model<ITrackingEventDocument>("TrackingEvent", TrackingEventSchema);
