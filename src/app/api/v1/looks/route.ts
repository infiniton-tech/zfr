import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Look } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = { approved: true };
    if (featured === "true") query.isFeatured = true;

    const looks = await Look.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ data: looks });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch looks" } }, { status: 500 });
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
    const { image, userName, caption, instagramHandle, isFeatured } = body;

    if (!image) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Image URL is required" } }, { status: 400 });
    }

    const look = await Look.create({ image, userName, caption, instagramHandle, isFeatured: isFeatured ?? false, approved: true });
    return NextResponse.json({ data: look }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create look" } }, { status: 500 });
  }
}
