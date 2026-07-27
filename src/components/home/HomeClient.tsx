"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { HeroSlider } from "./HeroSlider";
import { TrendingGrid } from "./TrendingGrid";
import { ProductSwiper } from "./ProductSwiper";
import { CommunitySection } from "./CommunitySection";
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
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Derive tabs from product categories as fallback
  const productTabs = useMemo(() => {
    const seen = new Map<string, CategoryInfo>();
    products.forEach((p) => {
      p.categories?.forEach((c) => {
        if (!seen.has(c.slug)) seen.set(c.slug, c);
      });
    });
    return Array.from(seen.values());
  }, [products]);

  // Use backend categories, fallback to product-derived
  const tabs = allCategories.length > 0 ? allCategories : productTabs;

  const activeTab = tabs.find((t) => t.slug === activeSlug) ?? tabs[0] ?? null;

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
  const filteredProducts = activeTab
    ? products.filter((p) => p.categories?.some((c) => c.slug === activeTab.slug))
    : products;

  const viewAllHref = activeTab
    ? `/${activeTab.gender || "man"}/${activeTab.slug}`
    : "/";

  if (!mounted) return null;

  // Shared Category Pills Component
  const CategoryPills = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? "px-4" : "px-6 md:px-12"} py-6 flex flex-col items-center justify-center gap-3 w-full`}>
      <div className="relative w-full max-w-full flex justify-center">
        <div
          ref={isMobile ? tabsRef : undefined}
          className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-none scroll-smooth max-w-full pb-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab?.slug === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveSlug(tab.slug)}
                className={`px-6 py-2 rounded-full text-xs font-medium border tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-800"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
        {/* Scroll hint animation */}
        {showScrollHint && tabs.length > 4 && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none flex items-center justify-end pr-2">
            <div className="flex flex-col items-center gap-0.5 animate-bounce">
              <div className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center bg-white shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              </div>
              <span className="text-[8px] text-neutral-400 tracking-wider">SWIPE</span>
            </div>
          </div>
        )}
      </div>
      {/* Tab indicator dot */}
      <div className="w-2 h-2 rounded-full bg-neutral-300" />
    </div>
  );

  // Shared Product Grid Component
  const ProductGrid = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "px-4" : "px-6 md:px-12"}>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-sm text-neutral-400">
          No products found in this category.
        </div>
      ) : (
        <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"} gap-x-4 gap-y-6`}>
          {filteredProducts.map((product) => (
            <div key={product._id} className="group flex flex-col">
              <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full bg-neutral-50 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-103"
                />
              </Link>
              <div className="mt-2 flex flex-col text-left px-0.5">
                <Link href={`/product/${product.slug}`} className="text-[13px] font-normal text-neutral-800 tracking-wide line-clamp-2 hover:text-black min-h-[36px] leading-snug">
                  {product.name}
                </Link>
                <div className="flex text-xs leading-none mt-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starIndex = i + 1;
                    const filled = product.rating === 0 || starIndex <= product.rating;
                    return <span key={i} className={filled ? "text-[#FBBF24]" : "text-neutral-300"}>★</span>;
                  })}
                </div>
                <span className="text-sm font-bold text-neutral-900 mt-1 font-sans">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
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

      {/* Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-36 right-4 z-40 md:hidden w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-md active:scale-95 transition-all text-neutral-800 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
