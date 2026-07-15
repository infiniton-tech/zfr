import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
    await connectDB();
    const body = await request.json();
    if (body.parentId === "") {
      body.parentId = null;
    }
    if (body.slug) {
      body.slug = body.slug.replace(/^\/+|\/+$/g, "").trim().toLowerCase();
    }
    const category = await Category.create(body);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("POST Category error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create category" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { ids } = await request.json() as { ids: string[] };
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No IDs provided" } }, { status: 400 });
    }
    const result = await Category.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ data: { deleted: result.deletedCount } });
  } catch (error) {
    console.error("DELETE Categories error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete categories" } }, { status: 500 });
  }
}

