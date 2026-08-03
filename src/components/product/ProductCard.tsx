"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    colors?: Array<{ name: string; hex: string }>;
    isNewArrival?: boolean;
    isSale?: boolean;
    rating?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="group flex flex-col h-full">
      {/* Image Container */}
      <div className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100 mb-2.5">
        <Link href={`/product/${product.slug}`} className="block relative w-full h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isSale && (
            <span className="bg-red-600 text-white text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase shadow-sm">
              SALE
            </span>
          )}
          {product.isNewArrival && !product.isSale && (
            <span className="bg-black text-white text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product._id);
          }}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-300 z-10",
            inWishlist
              ? "bg-red-50 text-red-500 scale-105"
              : "bg-white/80 hover:bg-white text-neutral-700 hover:text-black hover:scale-105"
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("w-3.5 h-3.5 md:w-4 md:h-4", inWishlist && "fill-current")} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 justify-between px-0.5">
        <div>
          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-200"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          )}

          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-medium text-neutral-800 line-clamp-2 leading-snug hover:text-black transition-colors"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-neutral-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[10px] text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center text-[10px] text-amber-500 font-medium">
            ★ {product.rating || 5.0}
          </div>
        </div>
      </div>
    </div>
  );
}
