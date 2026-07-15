import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Look } from "@/models";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await Look.findByIdAndDelete(id);
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete look" } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const look = await Look.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ data: look });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update look" } }, { status: 500 });
  }
}
