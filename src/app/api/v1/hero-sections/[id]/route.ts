import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit, summarizeChanges } from "@/lib/audit";
import { HeroSection } from "@/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const section = await HeroSection.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!section) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Hero section not found" } }, { status: 404 });
    logAudit(session, {
      action: "update",
      entity: "hero-section",
      entityId: String(section._id),
      entityLabel: section.title,
      summary: summarizeChanges(body),
      changes: body,
    });
    return NextResponse.json({ data: section });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update hero section" } }, { status: 500 });
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
    const section = await HeroSection.findByIdAndDelete(id).lean();
    if (section) {
      logAudit(session, {
        action: "delete",
        entity: "hero-section",
        entityId: String(section._id),
        entityLabel: section.title,
        summary: "Deleted hero section",
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete hero section" } }, { status: 500 });
  }
}
