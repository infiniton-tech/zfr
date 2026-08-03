"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { HeroSlider } from "./HeroSlider";
import { TrendingGrid } from "./TrendingGrid";
import { ProductSwiper } from "./ProductSwiper";
import { CommunitySection } from "./CommunitySection";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

interface CategoryInfo {
  name: string;
  slug: string;
  gender?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  categories: CategoryInfo[];
}

interface HomeClientProps {
  heroes: any[];
  trending: any[];
  position: string;
  products: Product[];
}

export function HomeClient({ heroes, trending, position, products }: HomeClientProps) {
  const trendingAboveHero = position === "above-heroes";
  const trendingBelowHero = position === "below-heroes" || position === "between-heroes";
  const trendingBelowProducts = !trendingAboveHero && !trendingBelowHero;

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Fetch all categories from backend (including subcategories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/categories?all=true");
        const json = await res.json();
        const categories = json.data || [];
        const mapped = categories.map((cat: any) => ({
          name: cat.name,
          slug: cat.slug,
          gender: cat.gender,
        }));
        setAllCategories(mapped);
      } catch {
        // Fallback to product-derived categories
        const seen = new Map<string, CategoryInfo>();
        products.forEach((p) => {
          p.categories?.forEach((c) => {
            if (!seen.has(c.slug)) seen.set(c.slug, c);
          });
        });
        setAllCategories(Array.from(seen.values()));
      }
    };
    fetchCategories();
  }, [products]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Derive tabs from backend categories or products so all categories show cleanly
  const tabs = useMemo(() => {
    const productCategoriesMap = new Map<string, CategoryInfo>();

    products.forEach((p) => {
      p.categories?.forEach((c) => {
        if (!productCategoriesMap.has(c.slug)) {
          productCategoriesMap.set(c.slug, c);
        }
      });
    });

    const productDerivedTabs = Array.from(productCategoriesMap.values());
    const categoryList = allCategories.length > 0 ? allCategories : productDerivedTabs;

    // Filter out generic top-level parent container "clothing-man" so subcategories (Panjabi, Shirts, Pants, T-shirts, Trousers, Jeans, Shoes, Accessories) show clearly
    const subCategories = categoryList.filter((c: CategoryInfo) => c.slug !== "clothing-man" && c.slug !== "clothing");

    return [{ name: "ALL", slug: "all" }, ...subCategories];
  }, [allCategories, products]);

  const activeTab = tabs.find((t) => t.slug === activeSlug) ?? tabs[0];

  // Hide scroll hint after user interaction
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollLeft > 20) {
        setShowScrollHint(false);
      }
    };
    el.addEventListener("scroll", handleScroll);
    // Auto-hide after 4 seconds
    const timer = setTimeout(() => setShowScrollHint(false), 4000);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [tabs.length]);

  // Filter products by selected active category tab
  const filteredProducts = !activeTab || activeTab.slug === "all"
    ? products
    : products.filter((p) => p.categories?.some((c) => c.slug === activeTab.slug));

  const viewAllHref = activeTab && activeTab.slug !== "all"
    ? `/${activeTab.gender || "man"}/${activeTab.slug}`
    : "/man";

  if (!mounted) return null;

  // Shared Category Pills Component
  const CategoryPills = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? "px-3" : "px-6 md:px-12"} py-4 flex flex-col items-center justify-center gap-2.5 w-full`}>
      <div className="w-full max-w-full">
        <div
          ref={isMobile ? tabsRef : undefined}
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none scroll-smooth max-w-full pb-1.5 px-1 snap-x snap-mandatory"
        >
          {tabs.map((tab) => {
            const isActive = activeTab?.slug === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveSlug(tab.slug)}
                className={`snap-start px-5 py-2 rounded-full text-[11px] font-medium tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white border border-black shadow-md shadow-black/10 scale-102 font-bold"
                    : "bg-neutral-50 text-neutral-700 border border-neutral-200/80 hover:border-neutral-800 hover:text-black"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Shared Product Grid Component
  const ProductGrid = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "px-3" : "px-6 md:px-12"}>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-sm text-neutral-400">
          No products found in this category.
        </div>
      ) : (
        <div className={`grid ${isMobile ? "grid-cols-2 gap-3" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8"}`}>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* MOBILE HOME PAGE */}
      <div className="block md:hidden bg-white min-h-screen pb-20">
        {trendingAboveHero && <TrendingGrid initialCategories={trending} />}
        <HeroSlider heroes={heroes} compact />
        <CategoryPills isMobile />
        <ProductGrid isMobile />
        {activeTab && (
          <div className="mt-8 mb-12 flex justify-center px-4">
            <Link
              href={viewAllHref}
              className="px-10 py-3.5 border border-neutral-200 text-xs font-semibold tracking-[0.2em] text-neutral-800 hover:border-black hover:text-black uppercase transition-colors rounded-sm"
            >
              VIEW ALL
            </Link>
          </div>
        )}
        <div className="mt-8">
          {(trendingBelowHero || trendingBelowProducts) && <TrendingGrid initialCategories={trending} />}
          <CommunitySection />
        </div>
      </div>

      {/* DESKTOP HOME PAGE */}
      <div className="hidden md:block">
        {trendingAboveHero && <TrendingGrid initialCategories={trending} />}
        <HeroSlider heroes={heroes} />
        <CategoryPills />
        <ProductGrid />
        {activeTab && (
          <div className="mt-10 mb-16 flex justify-center px-6 md:px-12">
            <Link
              href={viewAllHref}
              className="px-10 py-3.5 border border-neutral-200 text-xs font-semibold tracking-[0.2em] text-neutral-800 hover:border-black hover:text-black uppercase transition-colors rounded-sm"
            >
              VIEW ALL
            </Link>
          </div>
        )}
        {(trendingBelowHero || trendingBelowProducts) && (
          <div className="pt-4 md:pt-8">
            <TrendingGrid initialCategories={trending} />
          </div>
        )}
        <CommunitySection />
      </div>
    </>
  );
}
