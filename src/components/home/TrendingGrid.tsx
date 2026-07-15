"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeHref } from "@/lib/utils";

interface TrendingCategory {
  name: string;
  slug: string;
  image: string;
}

const FALLBACK_CATEGORIES: TrendingCategory[] = [
  {
    name: "TOPS",
    slug: "woman/tops-bodysuits",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80",
  },
  {
    name: "TROUSERS",
    slug: "woman/trousers",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop&q=80",
  },
  {
    name: "SKIRTS",
    slug: "woman/skirts",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&q=80",
  },
  {
    name: "FOOTWEAR",
    slug: "woman/shoes",
    image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&h=800&fit=crop&q=80",
  },
];

export function TrendingGrid({ initialCategories }: { initialCategories?: TrendingCategory[] }) {
  const [categories, setCategories] = useState<TrendingCategory[]>(initialCategories || []);
  
  // Animation states
  const [hasTriggered, setHasTriggered] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slider controls
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }
    return () => slider?.removeEventListener("scroll", checkScrollPosition);
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const tileWidth = sliderRef.current.firstElementChild?.clientWidth ?? 300;
    const scrollAmount = (tileWidth + 0) * 2;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (categories.length === 0) return;

    let fadeTimer: any;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play animation and fade out
          setHasTriggered(true);
          fadeTimer = setTimeout(() => {
            setFadeOut(true);
          }, 1200);
        } else {
          // Reset states when leaving viewport so it triggers again next time
          setHasTriggered(false);
          setFadeOut(false);
        }
      },
      { threshold: 0.15 } // Trigger when 15% of the section is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      clearTimeout(fadeTimer);
    };
  }, [categories.length]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;

    async function fetchTrending() {
      try {
        // 1. Try the curated Trending admin items first
        const res = await fetch("/api/v1/trending");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const mapped = json.data.map(
            (item: { name: string; ctaLink: string; image: string }) => ({
              name: item.name.toUpperCase(),
              slug: item.ctaLink.replace(/^\//, ""),
              image: item.image,
            })
          );
          setCategories(mapped);
          return;
        }
      } catch {
        // fall through
      }

      try {
        // 2. Fall back to trending products
        const res = await fetch("/api/v1/products?isTrending=true&limit=4");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const mapped = json.data.map(
            (p: { name: string; slug: string; images: string[] }) => ({
              name: p.name.toUpperCase(),
              slug: `product/${p.slug}`,
              image: p.images[0],
            })
          );
          setCategories(mapped);
          return;
        }
      } catch {
        // fall through
      }

      // 3. Last resort: hardcoded fallback
      setCategories(FALLBACK_CATEGORIES);
    }

    fetchTrending();
  }, [initialCategories]);

  if (categories.length === 0) return null; // still loading

  return (
    <section ref={containerRef} className="relative bg-white w-full overflow-hidden">
      {/* Scroll-triggered Black Overlay */}
      <div
        className={`absolute inset-0 z-20 bg-black/25 backdrop-blur-md text-white flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          fadeOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
      >
        {hasTriggered && (
          <h2 className="text-xl md:text-3xl font-light tracking-[0.25em] text-white uppercase animate-tracking-in-expand select-none">
            TRENDING NOW
          </h2>
        )}
        <div className="h-[1px] w-8 bg-white/40 mt-3" />
      </div>

      {/* Slider Nav Arrows */}
      {categories.length > 4 && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center bg-black/30 backdrop-blur-sm hover:bg-black/50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center bg-black/30 backdrop-blur-sm hover:bg-black/50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <div
        ref={sliderRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory w-full"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={normalizeHref(cat.slug)}
            className="group relative block w-1/2 md:w-1/4 shrink-0 snap-start"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted w-full">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Gradient Overlay for text contrast */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
              {/* Centered label */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border-b border-transparent group-hover:border-white pb-0.5 transition-all duration-300">
                  {cat.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
