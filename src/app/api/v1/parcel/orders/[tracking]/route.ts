import { NextResponse } from "next/server";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tracking: string }> }
) {
  try {
    const { tracking } = await params;
    const result = await parcelService.getDeliveryStatus(tracking);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get delivery status";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
