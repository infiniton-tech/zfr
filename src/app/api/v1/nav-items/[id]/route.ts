import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NavItem } from "@/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const item = await NavItem.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Nav item not found" } }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update nav item" } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await NavItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete nav item" } }, { status: 500 });
  }
}
