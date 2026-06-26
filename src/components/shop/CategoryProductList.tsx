"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { SlidersHorizontal, LayoutGrid, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors?: Array<{ name: string; hex: string }>;
  isNewArrival?: boolean;
  isSale?: boolean;
}

interface CategoryProductListProps {
  initialProducts: Product[];
  gender: string;
  category: string;
  categoryName: string;
  total: number;
}

const FILTER_CHIPS = [
  "Total Look", "Dresses", "Tops | Bodysuits", "T-shirts", "Shirts | Blouses",
  "Trousers", "Jeans", "Skirts", "Shorts", "Swimwear | Bikinis", "Denim",
];

export function CategoryProductList({
  initialProducts,
  gender,
  category,
  categoryName,
  total,
}: CategoryProductListProps) {
  // Mobile layout state: 1 column or 2 columns
  const [cols, setCols] = useState<1 | 2>(2);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {/* Header Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-medium tracking-[0.1em] uppercase">{categoryName}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* Views Toggle */}
            <div className="flex items-center gap-1.5 border-r border-border pr-4">
              <span className="hidden sm:inline mr-1 text-[10px] tracking-wider uppercase text-muted-foreground">Views</span>
              <button
                onClick={() => setCols(1)}
                className={cn(
                  "p-1 hover:text-foreground transition-colors",
                  cols === 1 ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                aria-label="Single column layout"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCols(2)}
                className={cn(
                  "p-1 hover:text-foreground transition-colors",
                  cols === 2 ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                aria-label="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_CHIPS.map((chip) => (
            <Link
              key={chip}
              href={`/${gender}/${chip.toLowerCase().replace(/\s+/g, "-").replace(/\|/g, "").replace(/--/g, "-")}`}
              className={`shrink-0 px-4 py-2 text-xs border transition-colors ${
                chip.toLowerCase().replace(/\s+/g, "-") === category
                  ? "bg-black text-white border-black"
                  : "bg-white text-foreground border-border hover:border-foreground"
              }`}
            >
              {chip}
            </Link>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 md:px-8 py-6">
        {initialProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <>
            <div className={cn(
              "grid gap-x-3 gap-y-8 transition-all duration-300",
              cols === 1 
                ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" 
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            )}>
              {initialProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
            {total > 24 && (
              <div className="flex justify-center mt-12">
                <button className="px-8 py-3 border border-foreground text-xs tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                  LOAD MORE
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
