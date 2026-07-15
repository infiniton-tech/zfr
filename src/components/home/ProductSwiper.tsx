"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  sku: string;
}

interface ProductSwiperProps {
  products: Product[];
}

export function ProductSwiper({ products }: ProductSwiperProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to enable/disable arrow buttons
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
      // Run once on load
      checkScrollPosition();
    }
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [products]);

  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      // Scroll by 1 card + gap width roughly
      const cardWidth = 280; // approximate width of card
      const gap = 16;
      const scrollAmount = direction === "left" 
        ? -(cardWidth + gap) * 2 
        : (cardWidth + gap) * 2;
      
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-neutral-50/50 border-t border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-neutral-400 uppercase block">
              Discover More
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black uppercase">
              RECOMMENDED FOR YOU
            </h2>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all bg-white hover:bg-neutral-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all bg-white hover:bg-neutral-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
              aria-label="Next Products"
            >
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {/* Carousel Slider */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-4"
        >
          {products.map((product) => {
            const productUrl = `/product/${product.slug}`;
            const firstImage = product.images?.[0];

            return (
              <div
                key={product._id}
                className="w-[240px] md:w-[280px] shrink-0 snap-start snap-always group"
              >
                <Link href={productUrl} className="block space-y-3">
                  {/* Image container */}
                  <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden border border-border/40 rounded-sm">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 240px, 280px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 uppercase">
                        No Image
                      </div>
                    )}
                    
                    {/* Hover look details indicator */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4">
                      <span className="bg-white text-black text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-sm shadow-sm flex items-center gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                        VIEW PRODUCT
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="space-y-1 text-left px-1">
                    <h3 className="text-xs font-semibold text-neutral-800 tracking-wide truncate group-hover:text-black transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-neutral-400 text-[10px]">{product.sku}</span>
                      <span className="font-bold text-black">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
