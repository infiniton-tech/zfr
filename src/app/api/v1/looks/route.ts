import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
