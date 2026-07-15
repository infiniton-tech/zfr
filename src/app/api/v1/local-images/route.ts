import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");
    const entries = await fs.readdir(imagesDir, { withFileTypes: true });

    const images = entries
      .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp|gif|svg)$/i.test(entry.name))
      .map((entry) => ({
        name: entry.name,
        url: `/images/${encodeURIComponent(entry.name)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    return NextResponse.json({ data: images });
  } catch (error) {
    console.error("GET local images error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to read local images" } },
      { status: 500 }
    );
  }
}
