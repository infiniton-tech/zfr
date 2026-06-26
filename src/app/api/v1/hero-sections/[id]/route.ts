import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HeroSection } from "@/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const section = await HeroSection.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!section) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Hero section not found" } }, { status: 404 });
    return NextResponse.json({ data: section });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update hero section" } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await HeroSection.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete hero section" } }, { status: 500 });
  }
}
