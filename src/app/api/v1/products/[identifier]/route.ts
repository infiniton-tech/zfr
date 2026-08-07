import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, summarizeChanges } from "@/lib/audit";
import { Product } from "@/models";

function isObjectId(str: string) {
  return mongoose.Types.ObjectId.isValid(str) && str.length === 24;
}

export async function GET(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;
    const query = isObjectId(identifier) ? { _id: identifier } : { slug: identifier };
    const product = await Product.findOne(query).lean();
    if (!product) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch product" } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { identifier } = await params;
    if (!isObjectId(identifier)) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Update requires an ObjectId" } }, { status: 400 });
    }
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(identifier, { $set: body }, { new: true }).lean();
    if (!product) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    logAudit(session, {
      action: "update",
      entity: "product",
      entityId: String(product._id),
      entityLabel: product.name,
      summary: summarizeChanges(body),
      changes: body,
    });
    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update product" } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { identifier } = await params;
    if (!isObjectId(identifier)) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Delete requires an ObjectId" } }, { status: 400 });
    }
    const product = await Product.findByIdAndDelete(identifier).lean();
    if (product) {
      logAudit(session, {
        action: "delete",
        entity: "product",
        entityId: String(product._id),
        entityLabel: product.name,
        summary: "Deleted product",
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete product" } }, { status: 500 });
  }
}
