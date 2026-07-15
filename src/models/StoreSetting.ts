import mongoose, { Schema, type Document } from "mongoose";

export interface IStoreSetting {
  key: string;
  value: string;
}

export interface IStoreSettingDocument extends Omit<IStoreSetting, "_id">, Document {}

const StoreSettingSchema = new Schema<IStoreSettingDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const StoreSetting =
  mongoose.models.StoreSetting ||
  mongoose.model<IStoreSettingDocument>("StoreSetting", StoreSettingSchema);
