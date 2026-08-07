import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { Category } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const parentId = searchParams.get("parentId");
    const all = searchParams.get("all") === "true";

    const query: Record<string, unknown> = { isActive: true };
    if (gender) query.gender = gender;
    
    if (all) {
      if (parentId) {
        query.parentId = parentId === "null" || parentId === "" ? null : parentId;
      }
    } else {
      if (parentId && parentId !== "null" && parentId !== "") {
        query.parentId = parentId;
      } else {
        query.parentId = null;
      }
    }

    const categories = await Category.find(query).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("GET Categories error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch categories" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    if (body.parentId === "") {
      body.parentId = null;
    }
    if (body.slug) {
      body.slug = body.slug.replace(/^\/+|\/+$/g, "").trim().toLowerCase();
    }
    const category = await Category.create(body);
    logAudit(session, {
      action: "create",
      entity: "category",
      entityId: String(category._id),
      entityLabel: category.name,
      summary: "Created category",
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("POST Category error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create category" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    await connectDB();
    const { ids } = await request.json() as { ids: string[] };
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No IDs provided" } }, { status: 400 });
    }
    const categories = await Category.find({ _id: { $in: ids } }).select("name").lean();
    const result = await Category.deleteMany({ _id: { $in: ids } });
    logAudit(session, {
      action: "delete",
      entity: "category",
      entityId: ids.join(", "),
      entityLabel: categories.map((c) => c.name).join(", ") || undefined,
      summary: `Deleted ${result.deletedCount ?? ids.length} categor${(result.deletedCount ?? ids.length) === 1 ? "y" : "ies"}`,
    });
    return NextResponse.json({ data: { deleted: result.deletedCount } });
  } catch (error) {
    console.error("DELETE Categories error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete categories" } }, { status: 500 });
  }
}

