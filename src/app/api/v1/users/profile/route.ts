import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { name, phone } },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
