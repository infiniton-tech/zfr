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
    name: "PANJABI",
    slug: "man/panjabi-man",
    image: "/images/navy_embroidered_panjabi.jpg",
  },
  {
    name: "SHIRTS",
    slug: "man/shirts-man",
    image: "/images/emerald_green_linen_shirt.jpg",
  },
  {
    name: "PANTS",
    slug: "man/pant-man",
    image: "/images/charcoal_grey_pant.jpg",
  },
  {
    name: "T-SHIRTS",
    slug: "man/t-shirts-man",
    image: "/images/sand_beige_shirt.jpg",
  },
  {
    name: "TROUSERS",
    slug: "man/trousers-man",
    image: "/images/charcoal_grey_pant.jpg",
  },
  {
    name: "JEANS",
    slug: "man/jeans-man",
    image: "/images/navy_white_stripe_shirt.jpg",
  },
  {
    name: "SHOES",
    slug: "man/shoes-man",
    image: "/images/chocolate_brown_shirt.jpg",
  },
  {
    name: "ACCESSORIES",
    slug: "man/accessories-man",
    image: "/images/black_designer_panjabi.jpg",
  },
];

export function TrendingGrid({ initialCategories }: { initialCategories?: TrendingCategory[] }) {
  const [categories, setCategories] = useState<TrendingCategory[]>(
    initialCategories && initialCategories.length > 0 ? initialCategories : FALLBACK_CATEGORIES
  );

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
    const tileWidth = sliderRef.current.firstElementChild?.clientWidth ?? 200;
    const scrollAmount = tileWidth * 2;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function fetchTrending() {
      try {
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
        // fall back to default categories
      }
    }

    if (!initialCategories || initialCategories.length === 0) {
      fetchTrending();
    }
  }, [initialCategories]);

  return (
    <section className="relative bg-white w-full py-6 md:py-10">
      {/* Section Header */}
      <div className="px-4 md:px-12 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm md:text-base font-bold tracking-[0.2em] text-neutral-900 uppercase">
            TRENDING CATEGORIES
          </h2>
          <p className="text-[11px] text-neutral-500 tracking-wider mt-0.5">
            Explore our full range of luxury menswear
          </p>
        </div>

        {/* Desktop / Mobile Slider Arrows */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center bg-white hover:bg-black hover:text-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center bg-white hover:bg-black hover:text-white active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel for All Categories */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory px-4 md:px-12 gap-3 md:gap-4 w-full pb-2"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={normalizeHref(cat.slug)}
            className="group relative block w-[42vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] shrink-0 snap-start rounded-lg overflow-hidden"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 w-full rounded-lg">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-108"
                sizes="(max-width: 768px) 42vw, 20vw"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:from-black/90 transition-colors duration-300" />
              
              {/* Category Title Label */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-center flex flex-col items-center justify-end">
                <span className="text-white text-xs md:text-sm font-bold tracking-[0.18em] uppercase drop-shadow-md">
                  {cat.name}
                </span>
                <span className="text-[9px] text-white/80 font-medium tracking-widest mt-1 uppercase border-b border-white/40 pb-0.5 group-hover:border-white transition-all">
                  Shop Now →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
