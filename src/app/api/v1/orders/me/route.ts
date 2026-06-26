import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
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

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: orders });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}
