import mongoose, { Schema, type Document } from "mongoose";

export interface INewsletterSubscriberDocument extends Document {
  email: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  }
);

export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriberDocument>("NewsletterSubscriber", NewsletterSubscriberSchema);
