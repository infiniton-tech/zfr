"use client";

import { useState, useEffect } from "react";

interface WelcomeSplashProps {
  preloadImages?: string[];
}

export function WelcomeSplash({ preloadImages }: WelcomeSplashProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Preload key images in background
    if (preloadImages && preloadImages.length > 0) {
      preloadImages.forEach((src) => {
        if (!src) return;
        const img = new globalThis.Image();
        img.src = src;
      });
    }

    // Force scroll to top on mount
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    // Start fade-out after 1.8 seconds
    const exitTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Unmount after fade-out finishes (2.4s total)
    const unmountTimer = setTimeout(() => {
      setVisible(false);
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    }, 2400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [preloadImages]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-neutral-950 text-white flex flex-col items-center justify-between py-16 px-6 select-none transition-opacity duration-600 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Subtitle */}
      <div className="text-[10px] md:text-xs font-light tracking-[0.4em] uppercase text-neutral-400">
        DHAKA • EST. 2026
      </div>

      {/* Center: BIG ZFR Logo & Text */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <img
            src="/logoo.png"
            alt="ZFR"
            className="h-32 sm:h-44 md:h-52 w-auto invert drop-shadow-[0_15px_35px_rgba(255,255,255,0.25)] animate-pulse"
          />
        </div>

        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent my-1" />

        <p className="text-xs md:text-sm font-light tracking-[0.4em] uppercase text-neutral-300">
          High Fashion Menswear
        </p>
      </div>

      {/* Bottom Progress Indicator */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-40 h-[2px] bg-neutral-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-white rounded-full animate-pulse w-full" />
        </div>
        <span className="text-[9px] text-neutral-500 tracking-[0.25em] uppercase">
          Welcome to ZFR
        </span>
      </div>
    </div>
  );
}
