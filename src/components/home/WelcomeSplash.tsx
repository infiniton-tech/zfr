"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/shared/Logo";

interface WelcomeSplashProps {
  preloadImages?: string[];
}

export function WelcomeSplash({ preloadImages }: WelcomeSplashProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Preload provided images during splash
    if (preloadImages && preloadImages.length > 0) {
      preloadImages.forEach((src) => {
        if (!src) return;
        const img = new globalThis.Image();
        img.src = src;
      });
    }

    // Prevent scrolling while splash screen is active
    document.body.style.overflow = "hidden";

    // Start fade out animation after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Completely unmount after 2.3 seconds
    const unmountTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-4 px-6 select-none">
        <h1 className="animate-tracking-in-expand">
          <Logo className="h-16 md:h-24 mx-auto" />
        </h1>
        <div className="h-[1px] w-12 bg-white/40 mx-auto" />
        <p className="text-xs md:text-sm font-light tracking-[0.4em] uppercase text-neutral-400">
          Welcome to the Storefront
        </p>
      </div>

      {/* Premium loader at the bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-[9px] tracking-[0.2em] text-neutral-500 uppercase">Loading Experience</span>
      </div>
    </div>
  );
}
