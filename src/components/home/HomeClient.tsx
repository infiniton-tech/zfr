"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
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
  // Admin-controlled placement of the Trending section:
  // "above-heroes" | "below-heroes" (legacy "between-heroes" behaves the same) | "below-products" (default)
  const trendingAboveHero = position === "above-heroes";
  const trendingBelowHero = position === "below-heroes" || position === "between-heroes";
  const trendingBelowProducts = !trendingAboveHero && !trendingBelowHero;

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Category tabs slider controls
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(true);

  const checkTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollTabsLeft(scrollLeft > 5);
      setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleTabsScroll = (direction: "left" | "right") => {
    if (!tabsRef.current) return;
    const scrollAmount = 160;
    tabsRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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

  // Category tabs derived from the categories actually attached to products
  const tabs = useMemo(() => {
    const seen = new Map<string, CategoryInfo>();
    products.forEach((p) => {
      p.categories?.forEach((c) => {
        if (!seen.has(c.slug)) seen.set(c.slug, c);
      });
    });
    return Array.from(seen.values());
  }, [products]);

  const activeTab = tabs.find((t) => t.slug === activeSlug) ?? tabs[0] ?? null;

  useEffect(() => {
    const el = tabsRef.current;
    if (el) {
      el.addEventListener("scroll", checkTabsScroll);
      checkTabsScroll();
    }
    return () => el?.removeEventListener("scroll", checkTabsScroll);
  }, [tabs.length]);

  // Filter products by selected active category tab
  const filteredProducts = activeTab
    ? products.filter((p) => p.categories?.some((c) => c.slug === activeTab.slug))
    : products;

  const viewAllHref = activeTab
    ? `/${activeTab.gender || "man"}/${activeTab.slug}`
    : "/";

  if (!mounted) return null;

  return (
    <>
      {/* MOBILE HOME PAGE (md:hidden) */}
      <div className="block md:hidden pt-[56px] bg-white min-h-screen pb-20">

        {/* Trending above hero (admin position setting) */}
        {trendingAboveHero && <TrendingGrid initialCategories={trending} />}

        {/* Hero auto slider (same backend data as desktop heroes) */}
        <HeroSlider heroes={heroes} compact />

        {/* Category Pills/Tabs (from backend categories) — product section always right after the hero */}
        {tabs.length > 0 && (
          <div className="py-6 px-4 flex flex-col items-center gap-3">
            <div className="relative flex items-center gap-2 max-w-full w-full">
              <button
                onClick={() => handleTabsScroll("left")}
                disabled={!canScrollTabsLeft}
                className="shrink-0 w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center bg-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-black" />
              </button>
              <div
                ref={tabsRef}
                className="flex items-center justify-start gap-3 overflow-x-auto scrollbar-none scroll-smooth max-w-full"
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
              <button
                onClick={() => handleTabsScroll("right")}
                disabled={!canScrollTabsRight}
                className="shrink-0 w-7 h-7 rounded-full border border-neutral-300 flex items-center justify-center bg-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="Next categories"
              >
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
            {/* Tab indicator dot */}
            <div className="w-2 h-2 rounded-full bg-neutral-300" />
          </div>
        )}

        {/* 2-Column Product Grid */}
        <div className="px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-400">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group flex flex-col">
                  {/* Image container */}
                  <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full bg-neutral-50 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-103"
                    />
                  </Link>

                  {/* Details */}
                  <div className="mt-2 flex flex-col text-left px-0.5">
                    <Link href={`/product/${product.slug}`} className="text-[13px] font-normal text-neutral-800 tracking-wide line-clamp-2 hover:text-black min-h-[36px] leading-snug">
                      {product.name}
                    </Link>

                    {/* Ratings */}
                    <div className="flex text-xs leading-none mt-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starIndex = i + 1;
                        const filled = product.rating === 0 || starIndex <= product.rating;
                        return <span key={i} className={filled ? "text-[#FBBF24]" : "text-neutral-300"}>★</span>;
                      })}
                    </div>

                    {/* Price */}
                    <span className="text-sm font-bold text-neutral-900 mt-1 font-sans">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {activeTab && (
          <div className="mt-8 flex justify-center px-4">
            <Link
              href={viewAllHref}
              className="px-10 py-3.5 border border-neutral-200 text-xs font-semibold tracking-[0.2em] text-neutral-800 hover:border-black hover:text-black uppercase transition-colors rounded-sm"
            >
              VIEW ALL
            </Link>
          </div>
        )}

        {/* Trending + Community (same backend sections as desktop) */}
        <div className="mt-10">
          {(trendingBelowHero || trendingBelowProducts) && <TrendingGrid initialCategories={trending} />}
          <CommunitySection />
        </div>

      </div>

      {/* DESKTOP HOME PAGE (hidden md:block) */}
      <div className="hidden md:block">
        {trendingAboveHero && <TrendingGrid initialCategories={trending} />}

        <HeroSlider heroes={heroes} />

        {/* All products carousel slider (image, name, price) — always right after the hero, full width */}
        <ProductSwiper products={products} />

        {(trendingBelowHero || trendingBelowProducts) && <TrendingGrid initialCategories={trending} />}

        <CommunitySection />
      </div>

      {/* Scroll To Top (mobile only; sits above the WhatsApp button) */}
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
