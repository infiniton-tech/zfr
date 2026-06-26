import { NextResponse } from "next/server";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const result = await parcelService.getPayments({ page, limit });
    return NextResponse.json({ data: result.data, meta: { page, limit, total: result.total } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get payments";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
