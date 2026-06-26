import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "zfr-products";

    if (!file) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 422 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Cloudinary first
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (!cloudName || cloudName === "demo") {
        throw new Error("Cloudinary is not configured or is set to demo");
      }

      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder,
                resource_type: file.type.startsWith("video/") ? "video" : "image",
                overwrite: true,
              },
              (error, result) => {
                if (error || !result) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        }
      );

      return NextResponse.json({
        data: {
          url: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          publicId: result.public_id,
        },
      });
    } catch (cloudinaryError: any) {
      console.warn("Cloudinary upload failed or not configured, falling back to local file storage...", cloudinaryError?.message || cloudinaryError);

      // Fallback: Save file to public/uploads
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure the directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate a safe unique filename
      const hash = crypto.randomBytes(8).toString("hex");
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_{2,}/g, "_");
      const filename = `${Date.now()}-${hash}-${cleanFileName}`;
      const filePath = path.join(uploadDir, filename);

      // Write to disk
      await fs.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      console.log(`Saved file locally to: ${filePath}`);

      return NextResponse.json({
        data: {
          url: fileUrl,
          secure_url: fileUrl,
          public_id: filename,
          publicId: filename,
        },
      });
    }
  } catch (error: any) {
    console.error("Global upload handler failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Upload failed" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = require("cloudinary").v2.utils.api_sign_request(
      { timestamp, folder: "zfr-products" },
      process.env.CLOUDINARY_API_SECRET || "dummy_secret"
    );

    return NextResponse.json({
      data: {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY || "dummy_key",
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo",
      },
    });
  } catch (error) {
    console.error("Failed to generate Cloudinary signature:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to generate signature" } },
      { status: 500 }
    );
  }
}

