import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review, Product } from "@/models";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: reviews });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch reviews" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // Check session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in to write a review" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "productId, rating, and comment are required" } },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Create review
    const review = await Review.create({
      productId,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      rating: Number(rating),
      comment: comment.trim(),
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit review" } },
      { status: 500 }
    );
  }
}
