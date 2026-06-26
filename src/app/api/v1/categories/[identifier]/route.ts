import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";

function isObjectId(str: string) {
  return mongoose.Types.ObjectId.isValid(str) && str.length === 24;
}

export async function GET(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;
    const query = isObjectId(identifier) ? { _id: identifier } : { slug: identifier };
    const category = await Category.findOne(query).lean();
    if (!category) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 });
    }
    const subcategories = await Category.find({ parentId: category._id }).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ data: { ...category, subcategories } });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch category" } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;
    if (!isObjectId(identifier)) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Update requires an ObjectId" } }, { status: 400 });
    }
    const body = await req.json();
    if (body.parentId === "") {
      body.parentId = null;
    }
    const category = await Category.findByIdAndUpdate(identifier, { $set: body }, { new: true }).lean();
    if (!category) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 });
    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("PATCH Category error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update category" } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await connectDB();
    const { identifier } = await params;
    if (!isObjectId(identifier)) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Delete requires an ObjectId" } }, { status: 400 });
    }
    await Category.deleteMany({ $or: [{ _id: identifier }, { parentId: identifier }] });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete category" } }, { status: 500 });
  }
}
