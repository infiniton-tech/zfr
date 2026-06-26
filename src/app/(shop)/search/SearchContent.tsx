"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Search as SearchIcon } from "lucide-react";

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

export function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setProducts(json.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    search();
  }, [search]);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-medium tracking-wide">SEARCH RESULTS FOR &quot;{query}&quot;</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted mb-3" />
                <div className="h-3 bg-muted w-3/4 mb-2" />
                <div className="h-3 bg-muted w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {query ? `No results found for "${query}"` : "Enter a search term to find products"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
