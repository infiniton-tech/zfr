import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
        { status: 422 }
      );
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Email already registered" } },
        { status: 409 }
      );
    }

    const passwordHash = await bcryptjs.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      name,
      role: "user",
      wishlist: [],
      addresses: [],
    });

    return NextResponse.json(
      { data: { id: user._id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Registration failed" } },
      { status: 500 }
    );
  }
}
