import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isCloudinaryConfigured = Boolean(
    cloudName &&
    cloudName !== "demo" &&
    apiKey &&
    apiSecret
  );

  const results: { url: string; publicId: string; source: "cloudinary" | "local"; name: string; createdAt?: string }[] = [];

  // 1. Fetch all images from Cloudinary if configured
  if (isCloudinaryConfigured) {
    try {
      const response = await cloudinary.api.resources({
        type: "upload",
        max_results: 500,
        resource_type: "image",
        direction: "desc",
      });
      for (const r of response.resources ?? []) {
        results.push({
          url: r.secure_url,
          publicId: r.public_id,
          source: "cloudinary",
          name: r.public_id.split("/").pop() ?? r.public_id,
          createdAt: r.created_at,
        });
      }
    } catch (err) {
      console.warn("Could not list Cloudinary resources:", err);
    }
  }

  // 2. Fetch from /public/uploads (local fallback when Cloudinary not configured or for local uploads)
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.isFile() && /\.(jpe?g|png|webp|gif|svg)$/i.test(entry.name)) {
        results.push({
          url: `/uploads/${encodeURIComponent(entry.name)}`,
          publicId: entry.name,
          source: "local",
          name: entry.name,
        });
      }
    }
  } catch {
    // ignore if dir doesn't exist
  }

  return NextResponse.json({
    data: results,
    cloudinaryConfigured: isCloudinaryConfigured,
  });
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    const { publicId, source } = await request.json() as { publicId: string; source: "cloudinary" | "local" };
    if (!publicId) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "publicId is required" } }, { status: 400 });
    }

    if (source === "cloudinary") {
      const response = await cloudinary.uploader.destroy(publicId);
      if (response.result === "ok" || response.result === "not found") {
        return NextResponse.json({ data: { success: true, result: response.result } });
      } else {
        return NextResponse.json({ error: { code: "CLOUDINARY_ERROR", message: `Failed to delete from Cloudinary: ${response.result}` } }, { status: 400 });
      }
    } else {
      const filename = path.basename(publicId);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      try {
        await fs.unlink(filePath);
        return NextResponse.json({ data: { success: true } });
      } catch (err: any) {
        if (err.code === "ENOENT") {
          return NextResponse.json({ error: { code: "NOT_FOUND", message: "File not found locally" } }, { status: 404 });
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("DELETE media error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete media item" } }, { status: 500 });
  }
}
