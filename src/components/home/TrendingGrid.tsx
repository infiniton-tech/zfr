"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

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

export function TrendingGrid() {
  const [categories, setCategories] = useState<TrendingCategory[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/v1/products?isTrending=true&limit=4");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const mapped = json.data.map((p: { name: string; slug: string; images: string[] }) => ({
            name: p.name.toUpperCase(),
            slug: `product/${p.slug}`,
            image: p.images[0],
          }));
          setCategories(mapped);
        }
      } catch {
        // Keep fallback
      }
    }
    fetchTrending();
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 md:px-12 bg-white">
      <h2 className="text-sm font-medium tracking-[0.1em] mb-8">TRENDING NOW</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/${cat.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <span className="text-xs font-medium tracking-wider">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
