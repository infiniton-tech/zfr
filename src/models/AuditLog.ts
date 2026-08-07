import mongoose, { Schema, type Document } from "mongoose";
import type { IAuditLog } from "@/types";

export interface IAuditLogDocument extends Omit<IAuditLog, "_id" | "createdAt" | "updatedAt">, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: "User", index: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String, required: true, index: true },
    action: { type: String, enum: ["create", "update", "delete"], required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String },
    entityLabel: { type: String },
    summary: { type: String },
    changes: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);
