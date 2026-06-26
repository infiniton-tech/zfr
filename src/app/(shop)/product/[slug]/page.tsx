import Link from "next/link";
import Image from "next/image";
import { Share2, Truck, RotateCcw, Ruler } from "lucide-react";
import { AddToCart } from "@/components/product/AddToCart";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { params: { slug: "test-product" } }
  ]
};

async function getProduct(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch {
    return null;
  }
}

async function getRelatedProducts(gender: string, excludeSlug: string) {
  try {
    await connectDB();
    const products = await Product.find({ gender, slug: { $ne: excludeSlug } })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

function ProductPageSkeleton() {
  return (
    <div className="pt-[56px] min-h-screen bg-white animate-pulse">
      <div className="px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] bg-neutral-100 w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative aspect-square bg-neutral-100" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="md:pt-4 space-y-6">
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-neutral-200 rounded" />
              <div className="h-4 w-1/4 bg-neutral-200 rounded" />
            </div>
            <div className="h-12 w-full bg-neutral-200 rounded" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-neutral-200 rounded" />
              <div className="h-12 flex-1 bg-neutral-200 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-neutral-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      {params.then(({ slug }) => (
        <ProductPageWrapper slug={slug} />
      ))}
    </Suspense>
  );
}

import { TrackProductView } from "@/components/product/TrackProductView";
import { ProductReviews } from "@/components/product/ProductReviews";

async function ProductPageWrapper({ slug }: { slug: string }) {
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="pt-20 text-center min-h-screen">
        <h1 className="text-xl font-medium">Product not found</h1>
        <Link href="/" className="text-sm text-muted-foreground underline mt-4 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const related = await getRelatedProducts(product.gender, slug);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <TrackProductView productId={product._id} productName={product.name} price={product.price} />
      <div className="px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square bg-muted overflow-hidden">
                    <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="12vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:pt-4">
            <h1 className="text-lg md:text-xl font-medium tracking-wide mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg font-semibold">{product.price.toFixed(2)} AED</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.compareAtPrice.toFixed(2)} AED
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <AddToCart product={product} />

            {/* Wishlist / Share */}
            <div className="flex items-center gap-3 mt-4 mb-8">
              <WishlistButton productId={product._id} className="flex-1 text-xs tracking-wider" showLabel />
              <button className="flex-1 flex items-center justify-center gap-2 p-4 border border-border hover:border-black transition-colors text-xs tracking-wider" aria-label="Share">
                <Share2 className="w-4 h-4" />
                SHARE
              </button>
            </div>

            {/* Info accordion */}
            <Accordion className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-xs tracking-wider">DESCRIPTION</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materials">
                <AccordionTrigger className="text-xs tracking-wider">MATERIALS & CARE</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {product.materials?.join(", ") || "See product label for details."}
                  {product.careInstructions && <p className="mt-2">{product.careInstructions}</p>}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-xs tracking-wider">SHIPPING & RETURNS</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Free standard shipping on orders over 200 AED. Returns accepted within 30 days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="size">
                <AccordionTrigger className="text-xs tracking-wider">SIZE GUIDE</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    <span>Check our size guide for the perfect fit.</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Free shipping over 200 AED</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RotateCcw className="w-4 h-4" />
                <span>30 day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product._id} />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="px-4 md:px-8 py-10 border-t border-border">
          <h2 className="text-sm font-medium tracking-[0.1em] mb-8">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((product: Record<string, unknown>) => (
              <ProductCard
                key={product._id as string}
                product={product as {
                  _id: string;
                  name: string;
                  slug: string;
                  price: number;
                  compareAtPrice?: number;
                  images: string[];
                  colors?: Array<{ name: string; hex: string }>;
                  isNew?: boolean;
                  isSale?: boolean;
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
