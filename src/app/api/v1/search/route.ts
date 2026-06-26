import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    })
      .limit(limit)
      .select("name slug images price")
      .lean();

    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Search failed" } }, { status: 500 });
  }
}
