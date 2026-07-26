import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Product, Category, HeroSection, Look, TrendingItem, User } from "@/models";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const clearCloudinary = body.clearCloudinary !== false;
    const clearLocal = body.clearLocal !== false;
    const clearDatabase = body.clearDatabase !== false;

    let cloudinaryStatus = "skipped";
    let localFilesDeletedCount = 0;
    const dbStats = {
      products: 0,
      categories: 0,
      heroSections: 0,
      looks: 0,
      trending: 0,
      users: 0,
    };

    // 1. Delete from Cloudinary
    if (clearCloudinary) {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (cloudName && cloudName !== "demo") {
          // Delete all image resources
          await cloudinary.api.delete_all_resources({
            resource_type: "image",
            type: "upload",
          }).catch((err) => {
            console.warn("Cloudinary delete_all_resources (images) warning:", err?.message || err);
          });

          // Delete all video resources
          await cloudinary.api.delete_all_resources({
            resource_type: "video",
            type: "upload",
          }).catch((err) => {
            console.warn("Cloudinary delete_all_resources (videos) warning:", err?.message || err);
          });

          cloudinaryStatus = "cleared";
        } else {
          cloudinaryStatus = "not_configured";
        }
      } catch (err: any) {
        console.error("Failed to clear Cloudinary media:", err);
        cloudinaryStatus = `error: ${err?.message || "Unknown error"}`;
      }
    }

    // 2. Delete local files from public/uploads
    if (clearLocal) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        const entries = await fs.readdir(uploadsDir, { withFileTypes: true }).catch(() => []);
        for (const entry of entries) {
          if (entry.isFile() && entry.name !== ".gitkeep") {
            const filePath = path.join(uploadsDir, entry.name);
            await fs.unlink(filePath).catch(() => {});
            localFilesDeletedCount++;
          }
        }
      } catch (err: any) {
        console.error("Failed to clear local uploads:", err);
      }
    }

    // 3. Reset image references in MongoDB database
    if (clearDatabase) {
      await connectDB();

      const pRes = await Product.updateMany({}, { $set: { images: [], image: "" } });
      dbStats.products = pRes.modifiedCount || 0;

      const cRes = await Category.updateMany({}, { $set: { image: "" } });
      dbStats.categories = cRes.modifiedCount || 0;

      const hRes = await HeroSection.updateMany({}, { $set: { image: "" } });
      dbStats.heroSections = hRes.modifiedCount || 0;

      const lRes = await Look.updateMany({}, { $set: { image: "" } });
      dbStats.looks = lRes.modifiedCount || 0;

      const tRes = await TrendingItem.updateMany({}, { $set: { image: "" } });
      dbStats.trending = tRes.modifiedCount || 0;

      const uRes = await User.updateMany({}, { $set: { image: "" } });
      dbStats.users = uRes.modifiedCount || 0;
    }

    return NextResponse.json({
      data: {
        success: true,
        cloudinaryStatus,
        localFilesDeletedCount,
        dbStats,
      },
    });
  } catch (error: any) {
    console.error("POST /api/v1/media/clear-all error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to clear media" } },
      { status: 500 }
    );
  }
}
