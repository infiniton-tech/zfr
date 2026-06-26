import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NavItem } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const query: Record<string, unknown> = { isActive: true };
    if (position) query.position = position;

    const items = await NavItem.find(query).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch nav items" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const item = await NavItem.create(body);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create nav item" } }, { status: 500 });
  }
}
