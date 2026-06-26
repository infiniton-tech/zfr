import { NextResponse } from "next/server";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await parcelService.placeOrder(body);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await parcelService.placeBulkOrders(body.orders);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place bulk orders";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
