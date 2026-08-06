"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { SlidersHorizontal, LayoutGrid, LayoutList, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors?: Array<{ name: string; hex: string; image?: string }>;
  sizes?: Array<{ name: string; inStock: boolean }>;
  isNewArrival?: boolean;
  isSale?: boolean;
}

interface CategoryProductListProps {
  initialProducts: Product[];
  gender: string;
  category: string;
  categoryName: string;
  total: number;
  relatedCategories?: Array<{ _id: string; name: string; slug: string }>;
}

export function CategoryProductList({
  initialProducts,
  gender,
  category,
  categoryName,
  total,
  relatedCategories = [],
}: CategoryProductListProps) {
  // Mobile & Desktop grid layout state: 1 (fewer, larger columns) or 2 (more, smaller columns)
  const [cols, setCols] = useState<1 | 2>(2);

  // Filters state
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Dynamically extract unique colors and sizes available in this category's products
  const allSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    initialProducts.forEach((p) => {
      p.sizes?.forEach((s) => {
        if (s.name) sizesSet.add(s.name);
      });
    });
    return Array.from(sizesSet);
  }, [initialProducts]);

  const allColors = useMemo(() => {
    const colorsSet = new Set<string>();
    initialProducts.forEach((p) => {
      p.colors?.forEach((c) => {
        if (c.name) colorsSet.add(c.name);
      });
    });
    return Array.from(colorsSet);
  }, [initialProducts]);

  // Color map for hex lookups
  const colorHexMap = useMemo(() => {
    const map: Record<string, string> = {};
    initialProducts.forEach((p) => {
      p.colors?.forEach((c) => {
        if (c.name && c.hex) map[c.name.toLowerCase().trim()] = c.hex;
      });
    });
    return map;
  }, [initialProducts]);

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleReset = () => {
    setSortBy("latest");
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Perform client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Color filter
        if (selectedColors.length > 0) {
          const hasColor = product.colors?.some((c) => selectedColors.includes(c.name));
          if (!hasColor) return false;
        }
        // Size filter
        if (selectedSizes.length > 0) {
          const hasSize = product.sizes?.some((s) => selectedSizes.includes(s.name) && s.inStock);
          if (!hasSize) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // Default matches initialProducts sort (e.g. latest createdAt)
      });
  }, [initialProducts, sortBy, selectedColors, selectedSizes]);

  const activeFiltersCount = selectedColors.length + selectedSizes.length + (sortBy !== "latest" ? 1 : 0);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {/* Header Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-sm font-medium tracking-[0.1em] uppercase">
              {categoryName}
              <span className="text-xs text-muted-foreground font-normal normal-case ml-2">
                ({filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-muted-foreground">
            {/* Views Toggle */}
            <div className="flex items-center gap-1.5 border-r border-border pr-6">
              <span className="hidden sm:inline mr-1 text-[10px] tracking-wider uppercase text-muted-foreground">View</span>
              <button
                onClick={() => setCols(1)}
                className={cn(
                  "p-1 hover:text-foreground transition-colors",
                  cols === 1 ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                aria-label="Fewer columns"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCols(2)}
                className={cn(
                  "p-1 hover:text-foreground transition-colors",
                  cols === 2 ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                aria-label="More columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            
            {/* Filters toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                "flex items-center gap-1.5 hover:text-foreground transition-colors py-1 px-2.5 border",
                filterOpen || activeFiltersCount > 0 ? "border-black text-black bg-muted/20" : "border-transparent"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-black text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Sort Option */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground block">Sort By</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "latest", label: "Newest" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "name", label: "A-Z" }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs border transition-colors",
                      sortBy === opt.value
                        ? "bg-black text-white border-black"
                        : "bg-white text-muted-foreground border-border hover:border-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Options */}
            {allSizes.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground block">Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={cn(
                          "w-9 h-9 flex items-center justify-center text-xs border transition-colors",
                          isSelected
                            ? "bg-black text-white border-black font-semibold"
                            : "bg-white text-muted-foreground border-border hover:border-muted-foreground"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Options */}
            {allColors.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground block">Colors</span>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((colorName) => {
                    const isSelected = selectedColors.includes(colorName);
                    const hex = colorHexMap[colorName.toLowerCase().trim()] || "#ccc";
                    return (
                      <button
                        key={colorName}
                        onClick={() => handleColorToggle(colorName)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors rounded-full",
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-muted-foreground border-border hover:border-muted-foreground"
                        )}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset / Actions */}
            {activeFiltersCount > 0 && (
              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Category Chips / Navigation */}
        {relatedCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-hide">
            {relatedCategories.map((cat) => {
              const isActive = cat.slug === category ||
                cat.slug.replace(new RegExp(`-${gender}$`), "") === category.replace(new RegExp(`-${gender}$`), "");
              return (
                <Link
                  key={cat._id}
                  href={`/${gender}/${cat.slug}`}
                  className={`shrink-0 px-4 py-2 text-[10px] font-medium tracking-wider border transition-colors ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {cat.name.toUpperCase()}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="px-4 md:px-8 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">No products match your criteria</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-black text-white text-[10px] font-medium tracking-widest hover:bg-black/90 transition-colors"
              >
                CLEAR ALL FILTERS
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={cn(
              "grid gap-x-4 gap-y-10 transition-all duration-300",
              cols === 1 
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
            )}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
            {filteredProducts.length > 24 && (
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
