import { NextResponse } from "next/server";
import * as parcelService from "@/modules/parcel/parcel.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || undefined;
    const result = await parcelService.getPoliceStations(city);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get police stations";
    return NextResponse.json({ error: { code: "PARCEL_ERROR", message } }, { status: 500 });
  }
}
