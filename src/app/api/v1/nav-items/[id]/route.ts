import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, summarizeChanges } from "@/lib/audit";
import { NavItem } from "@/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const item = await NavItem.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Nav item not found" } }, { status: 404 });
    logAudit(session, {
      action: "update",
      entity: "nav-item",
      entityId: String(item._id),
      entityLabel: item.label,
      summary: summarizeChanges(body),
      changes: body,
    });
    return NextResponse.json({ data: item });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update nav item" } }, { status: 500 });
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
    const item = await NavItem.findByIdAndDelete(id).lean();
    if (item) {
      logAudit(session, {
        action: "delete",
        entity: "nav-item",
        entityId: String(item._id),
        entityLabel: item.label,
        summary: "Deleted nav item",
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete nav item" } }, { status: 500 });
  }
}
