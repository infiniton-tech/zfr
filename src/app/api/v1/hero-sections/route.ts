import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { HeroSection } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const query: Record<string, unknown> = { isActive: true };
    if (gender) query.gender = gender;

    const sections = await HeroSection.find(query).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ data: sections });
  } catch (error) {
    console.error("GET Hero Sections error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch hero sections" } }, { status: 500 });
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
    const section = await HeroSection.create(body);
    return NextResponse.json({ data: section }, { status: 201 });
  } catch (error) {
    console.error("POST Hero Sections error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create hero section" } }, { status: 500 });
  }
}
