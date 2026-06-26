import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const updateFields: Record<string, any> = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("userId", "name email").lean();

    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update order" } },
      { status: 500 }
    );
  }
}
