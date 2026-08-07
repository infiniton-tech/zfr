import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
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
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

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

    logAudit(session, {
      action: "update",
      entity: "store-setting",
      entityId: setting?._id ? String(setting._id) : undefined,
      entityLabel: key,
      summary: `Set setting key: ${key}`,
      changes: { key, value },
    });

    return NextResponse.json({ data: setting });
  } catch (error: any) {
    console.error("POST Store Settings error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to save setting" } },
      { status: 500 }
    );
  }
}
