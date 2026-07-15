"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSection } from "./HeroSection";
import { normalizeHref } from "@/lib/utils";

interface Hero {
  title: string;
  subtitle?: string;
  image?: string;
  leftImage?: string;
  rightImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSliderProps {
  heroes: Hero[];
  /** compact: mobile banner style; otherwise full-screen HeroSection slides */
  compact?: boolean;
  intervalMs?: number;
}

export function HeroSlider({ heroes, compact = false, intervalMs = 5000 }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = heroes.length;

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, paused, intervalMs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 50) goTo(index + (delta < 0 ? 1 : -1));
      touchStartX.current = null;
    }
    setPaused(false);
  };

  if (count === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden ${compact ? "aspect-[3/2] bg-neutral-100" : "h-screen"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {heroes.map((hero, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!active}
          >
            {compact ? (
              <Link href={normalizeHref(hero.ctaLink)} className="block relative w-full h-full">
                <img
                  src={hero.leftImage || hero.image}
                  alt={hero.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 pb-8 flex flex-col items-center text-white text-center px-4">
                  <h2 className="text-lg font-light tracking-[0.15em] drop-shadow uppercase">{hero.title}</h2>
                  {hero.ctaText && (
                    <span className="mt-2 inline-block bg-white text-black text-[10px] font-medium tracking-[0.2em] px-5 py-2 uppercase">
                      {hero.ctaText}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <HeroSection
                title={hero.title}
                subtitle={hero.subtitle}
                image={hero.image}
                leftImage={hero.leftImage}
                rightImage={hero.rightImage}
                ctaText={hero.ctaText || ""}
                ctaLink={hero.ctaLink || "/"}
              />
            )}
          </div>
        );
      })}

      {count > 1 && (
        <>
          {/* Arrows (desktop slider only) */}
          {!compact && (
            <>
              <button
                onClick={() => goTo(index - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(index + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          <div className={`absolute inset-x-0 z-20 flex items-center justify-center gap-2 ${compact ? "bottom-2" : "bottom-6"}`}>
            {heroes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
