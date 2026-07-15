import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Setup endpoint is disabled" } },
        { status: 403 }
      );
    }
    if (request.headers.get("x-setup-secret") !== setupSecret) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid setup secret" } },
        { status: 401 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "ADMIN_EMAIL and ADMIN_PASSWORD must be set" } },
        { status: 500 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: adminEmail }).lean();
    if (existing) {
      return NextResponse.json({
        message: "Admin user already exists",
        email: existing.email,
        role: existing.role,
      });
    }

    const passwordHash = await bcryptjs.hash(adminPassword, 12);
    const user = await User.create({
      email: adminEmail,
      passwordHash,
      name: "ZFR Admin",
      role: "admin",
      wishlist: [],
      addresses: [],
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      email: user.email,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create admin user" } },
      { status: 500 }
    );
  }
}
