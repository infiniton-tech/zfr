import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import bcryptjs from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@zfr.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

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
