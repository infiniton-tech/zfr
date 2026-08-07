"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Look {
  _id: string;
  image: string;
}

export function CommunitySection() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLooks() {
      try {
        const res = await fetch("/api/v1/looks?limit=10");
        const json = await res.json();
        const data = json.data || [];
        setLooks(data);
      } catch {
        setLooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLooks();
  }, []);

  if (loading || looks.length === 0) return null;

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
