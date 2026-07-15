import { CategoryProductList } from "@/components/shop/CategoryProductList";
import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models";
import { Suspense } from "react";
import { connection } from "next/server";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { params: { gender: "woman", category: "dresses" } }
  ]
};

async function getProducts(gender: string, category: string) {
  try {
    await connection();
    await connectDB();
    const query: Record<string, any> = {};
    if (gender) query.gender = gender;

    let finalQuery = query;
    if (category) {
      const catDoc = await Category.findOne({ slug: category }).lean();
      if (catDoc) {
        const subCats = await Category.find({ parentId: catDoc._id }).lean();
        const catIds = [catDoc._id, ...subCats.map((c: any) => c._id)];
        finalQuery = { ...query, categoryIds: { $in: catIds } };
      }
    }

    const [products, total] = await Promise.all([
      Product.find(finalQuery).sort({ createdAt: -1 }).limit(24).lean(),
      Product.countDocuments(finalQuery),
    ]);

    return {
      data: JSON.parse(JSON.stringify(products)),
      meta: { total },
    };
  } catch (error) {
    console.error("Failed to query products directly:", error);
    return { data: [], meta: { total: 0 } };
  }
}

async function getCategoryData(slug: string) {
  try {
    await connection();
    await connectDB();
    const cat = await Category.findOne({ slug }).lean();
    if (!cat) return null;

    let relatedCategories = [];
    if (!cat.parentId) {
      relatedCategories = await Category.find({ parentId: cat._id, isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
    } else {
      relatedCategories = await Category.find({ parentId: cat.parentId, isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
    }

    return {
      category: JSON.parse(JSON.stringify(cat)),
      relatedCategories: JSON.parse(JSON.stringify(relatedCategories)),
    };
  } catch {
    return null;
  }
}

export default async function ProductListingPage({
  params,
}: {
  params: Promise<{ gender: string; category: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="pt-[56px] px-4 md:px-8 py-6 md:py-10">
        <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-neutral-100 rounded animate-pulse w-full" />
              <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    }>
      {params.then(({ gender, category }) => (
        <ProductListingWrapper gender={gender} category={category} />
      ))}
    </Suspense>
  );
}

async function ProductListingWrapper({ gender, category }: { gender: string; category: string }) {
  const { data: products, meta } = await getProducts(gender, category);
  const catData = await getCategoryData(category);

  const categoryName = catData?.category?.name || category.replace(/-/g, " ").toUpperCase();
  const relatedCategories = catData?.relatedCategories || [];

  return (
    <CategoryProductList
      initialProducts={products}
      gender={gender}
      category={category}
      categoryName={categoryName}
      total={meta.total}
      relatedCategories={relatedCategories}
    />
  );
}
