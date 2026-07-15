"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Look {
  _id: string;
  image: string;
}

const FALLBACK_LOOKS = [
  { _id: "f1", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80" },
  { _id: "f2", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop&q=80" },
  { _id: "f3", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&q=80" },
  { _id: "f4", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop&q=80" },
  { _id: "f5", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80" },
  { _id: "f6", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80" },
  { _id: "f7", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop&q=80" },
  { _id: "f8", image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop&q=80" },
  { _id: "f9", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80" },
  { _id: "f10", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&q=80" },
];

export function CommunitySection() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLooks() {
      try {
        const res = await fetch("/api/v1/looks?limit=10");
        const json = await res.json();
        const data = json.data || [];
        setLooks(data.length > 0 ? data : FALLBACK_LOOKS);
      } catch {
        setLooks(FALLBACK_LOOKS);
      } finally {
        setLoading(false);
      }
    }
    fetchLooks();
  }, []);

  if (loading) return null;

  return (
    <section className="relative py-12 md:py-16">
      {/* Background Grid */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-0.5">
        {looks.map((look, i) => (
          <div key={look._id || i} className="relative bg-muted">
            <Image
              src={look.image}
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
