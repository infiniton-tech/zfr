import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    const body = await request.json();
    const result = await parcelService.placeOrder(body);
    logAudit(session, {
      action: "create",
      entity: "parcel-order",
      entityLabel: result?.trackingNumber || body?.reference || "parcel order",
      summary: "Placed parcel order",
      changes: body,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    const body = await request.json();
    const result = await parcelService.placeBulkOrders(body.orders);
    logAudit(session, {
      action: "update",
      entity: "parcel-order",
      entityLabel: Array.isArray(body?.orders) ? `bulk (${body.orders.length} orders)` : "bulk",
      summary: "Placed bulk parcel orders",
      changes: body,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place bulk orders";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
