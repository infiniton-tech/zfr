import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Product } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const sort = searchParams.get("sort") || "createdAt";
    const search = searchParams.get("search");
    const isTrending = searchParams.get("isTrending");
    const isNew = searchParams.get("isNew");
    const isSale = searchParams.get("isSale");

    const query: Record<string, unknown> = {};
    if (gender) query.gender = gender;
    if (isTrending === "true") query.isTrending = true;
    if (isNew === "true") query.isNewArrival = true;
    if (isSale === "true") query.isSale = true;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sortOption: Record<string, 1 | -1> = {};
    if (sort === "price-asc") sortOption.price = 1;
    else if (sort === "price-desc") sortOption.price = -1;
    else if (sort === "name") sortOption.name = 1;
    else sortOption.createdAt = -1;

    let finalQuery = query;
    if (category) {
      const cats = await import("@/models").then((m) => m.Category);
      const catDoc = await cats.findOne({ slug: category }).lean();
      if (catDoc) {
        const subCats = await cats.find({ parentId: catDoc._id }).lean();
        const catIds = [catDoc._id, ...subCats.map((c) => c._id)];
        finalQuery = { ...query, categoryIds: { $in: catIds } };
      }
    }

    const [products, total] = await Promise.all([
      Product.find(finalQuery).sort(sortOption).skip(skip).limit(limit).lean(),
      Product.countDocuments(finalQuery),
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch products" } }, { status: 500 });
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
    const product = await Product.create(body);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create product" } }, { status: 500 });
  }
}
