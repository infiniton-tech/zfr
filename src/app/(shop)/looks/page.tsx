"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Look {
  _id: string;
  image: string;
  userName?: string;
  caption?: string;
  instagramHandle?: string;
  likes: number;
}

export default function LooksPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLooks() {
      try {
        const res = await fetch("/api/v1/looks?limit=100");
        const json = await res.json();
        setLooks(json.data || []);
      } catch {
        setLooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLooks();
  }, []);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">#INZFR</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get inspired by our community and share your looks using #INZFR
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">Loading looks...</p>
          </div>
        ) : looks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No community looks shared yet.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {looks.map((look, i) => (
              <div key={look._id} className="break-inside-avoid relative group overflow-hidden border border-muted/20 rounded-md">
                <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
                  <Image
                    src={look.image}
                    alt={look.caption || "Community look"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                    {look.userName && <p className="text-xs font-semibold text-white">{look.userName}</p>}
                    {look.instagramHandle && <p className="text-[10px] text-white/80">{look.instagramHandle}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
