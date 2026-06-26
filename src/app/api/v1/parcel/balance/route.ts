import { NextResponse } from "next/server";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function GET() {
  try {
    const result = await parcelService.getBalance();
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get balance";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
