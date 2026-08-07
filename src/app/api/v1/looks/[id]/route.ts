import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, summarizeChanges } from "@/lib/audit";
import { Look } from "@/models";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const look = await Look.findByIdAndDelete(id);
    if (look) {
      logAudit(session, {
        action: "delete",
        entity: "look",
        entityId: String(look._id),
        entityLabel: look.userName || look.caption,
        summary: "Deleted look",
      });
    }
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete look" } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const look = await Look.findByIdAndUpdate(id, body, { new: true });
    if (look) {
      logAudit(session, {
        action: "update",
        entity: "look",
        entityId: String(look._id),
        entityLabel: look.userName || look.caption,
        summary: summarizeChanges(body),
        changes: body,
      });
    }
    return NextResponse.json({ data: look });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update look" } }, { status: 500 });
  }
}
