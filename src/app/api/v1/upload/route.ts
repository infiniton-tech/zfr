import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { v2 as cloudinarySdk } from "cloudinary";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

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

    // Upload to Cloudinary (no local-disk fallback: it does not persist on serverless hosts)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (
      !cloudName ||
      cloudName === "demo" ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CLOUDINARY_NOT_CONFIGURED",
            message:
              "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the server environment.",
          },
        },
        { status: 500 }
      );
    }

    try {
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

      logAudit(session, {
        action: "create",
        entity: "media",
        entityId: result.public_id,
        entityLabel: `${file.name} (${folder})`,
        summary: `Uploaded to Cloudinary folder '${folder}'`,
      });

      return NextResponse.json({
        data: {
          url: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          publicId: result.public_id,
          source: "cloudinary",
        },
      });
    } catch (cloudinaryError: unknown) {
      const cloudinaryMessage = cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError);
      console.error("Cloudinary upload failed:", cloudinaryMessage);
      return NextResponse.json(
        {
          error: {
            code: "CLOUDINARY_UPLOAD_FAILED",
            message: `Upload to Cloudinary failed: ${cloudinaryMessage}`,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Global upload handler failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Upload failed" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 403 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinarySdk.utils.api_sign_request(
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

