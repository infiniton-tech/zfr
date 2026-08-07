import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, summarizeChanges } from "@/lib/audit";
import { TrendingItem } from "@/models";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const item = await TrendingItem.findByIdAndUpdate(id, body, { new: true });
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Item not found" } }, { status: 404 });
    logAudit(session, {
      action: "update",
      entity: "trending",
      entityId: String(item._id),
      entityLabel: item.name,
      summary: summarizeChanges(body),
      changes: body,
    });
    return NextResponse.json({ data: item });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update" } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const item = await TrendingItem.findByIdAndDelete(id);
    if (item) {
      logAudit(session, {
        action: "delete",
        entity: "trending",
        entityId: String(item._id),
        entityLabel: item.name,
        summary: "Deleted trending item",
      });
    }
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete" } }, { status: 500 });
  }
}
