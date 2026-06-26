import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrackingEvent } from "@/models";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { visitorId, eventType, productId, url, metadata } = body;

    if (!visitorId || !eventType) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "visitorId and eventType are required" } },
        { status: 400 }
      );
    }

    // Get current user session if available
    const session = await auth();
    const userId = session?.user?.id;

    const event = await TrackingEvent.create({
      visitorId,
      userId: userId || undefined,
      eventType,
      productId: productId || undefined,
      url,
      metadata,
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to log event" } },
      { status: 500 }
    );
  }
}
