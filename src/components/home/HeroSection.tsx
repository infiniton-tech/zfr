"use client";

import Link from "next/link";
import Image from "next/image";
import { normalizeHref } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  image?: string;
  leftImage?: string;
  rightImage?: string;
  ctaText: string;
  ctaLink: string;
}

export function HeroSection({ title, subtitle, image, leftImage, rightImage, ctaText, ctaLink }: HeroSectionProps) {
  const hasDualImages = leftImage && rightImage && leftImage !== rightImage;
  const singleImage = leftImage || image || "";

  return (
    <section className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {hasDualImages ? (
        <>
          {/* Left Image */}
          <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
            <Image
              src={leftImage}
              alt={`${title} left`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Right Image */}
          <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
            <Image
              src={rightImage}
              alt={`${title} right`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </>
      ) : (
        /* Full Width Single Image */
        <div className="relative w-full h-full">
          <Image
            src={singleImage}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Dark gradient overlay for text and header readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

      {/* Centered Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-32 text-white z-20">
        <h2 className="text-3xl md:text-5xl font-light tracking-[0.15em] mb-4 drop-shadow-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base font-light tracking-wider mb-8 opacity-90 drop-shadow">
            {subtitle}
          </p>
        )}
        <Link
          href={normalizeHref(ctaLink)}
          className="inline-block bg-white text-black text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
