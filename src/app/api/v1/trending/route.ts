import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TrendingItem } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const items = await TrendingItem.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch trending items" } }, { status: 500 });
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
    const { name, image, ctaLink, sortOrder, isActive } = body;

    if (!name || !image || !ctaLink) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "name, image and ctaLink are required" } },
        { status: 400 }
      );
    }

    const item = await TrendingItem.create({
      name,
      image,
      ctaLink,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create trending item" } }, { status: 500 });
  }
}
