"use client";

import Link from "next/link";
import Image from "next/image";

const LOOKS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=500&fit=crop&q=80",
];

export function CommunitySection() {
  return (
    <section className="relative py-12 md:py-16">
      {/* Background Grid */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-0.5">
        {LOOKS.map((img, i) => (
          <div key={i} className="relative">
            <Image
              src={img}
              alt={`Community look ${i + 1}`}
              fill
              className="object-cover"
              sizes="20vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-20 md:py-32 text-center text-white px-4">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">#INZFR</h2>
        <p className="text-sm md:text-base font-light tracking-wider mb-8 max-w-md">
          Get inspired by our community and share your looks using #INZFR and mentioning @zfr
        </p>
        <Link
          href="/looks"
          className="inline-block bg-white text-black text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
        >
          SEE MORE LOOKS
        </Link>
      </div>
    </section>
  );
}
