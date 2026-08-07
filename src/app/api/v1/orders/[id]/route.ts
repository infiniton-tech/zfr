import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, Product } from "@/models";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

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

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Keep inventory in sync when an order crosses the cancelled boundary
    if (status && status !== existing.status) {
      const restock = status === "cancelled" && existing.status !== "cancelled";
      const rededuct = status !== "cancelled" && existing.status === "cancelled";
      if (restock || rededuct) {
        const sign = restock ? 1 : -1;
        for (const item of existing.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockQuantity: sign * item.quantity },
          });
        }
      }
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("userId", "name email").lean();

    const transitions: string[] = [];
    if (status && status !== existing.status) {
      transitions.push(`status: ${existing.status} → ${status}`);
    }
    if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      transitions.push(`paymentStatus: ${existing.paymentStatus} → ${paymentStatus}`);
    }
    logAudit(session, {
      action: "update",
      entity: "order",
      entityId: String(order?._id ?? existing._id),
      entityLabel: existing.orderNumber,
      summary: transitions.length > 0 ? transitions.join("; ") : "Updated order",
      changes: body,
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update order" } },
      { status: 500 }
    );
  }
}
