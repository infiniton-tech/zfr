import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({}),
    ]);

    return NextResponse.json({
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch users" } }, { status: 500 });
  }
}
