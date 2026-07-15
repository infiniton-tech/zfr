import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { StoreSetting } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await StoreSetting.findOne({ key }).lean();
      return NextResponse.json({ data: setting });
    }

    const settings = await StoreSetting.find({}).lean();
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    console.error("GET Store Settings error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch settings" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { key, value } = body as { key: string; value: string };

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "key and value are required" } },
        { status: 400 }
      );
    }

    // Upsert the setting
    const setting = await StoreSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ data: setting });
  } catch (error: any) {
    console.error("POST Store Settings error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to save setting" } },
      { status: 500 }
    );
  }
}
