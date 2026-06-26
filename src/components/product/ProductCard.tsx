"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="group">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-muted mb-3">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isSale && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] tracking-wider px-2 py-1">
            SALE
          </span>
        )}
        {product.isNewArrival && !product.isSale && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] tracking-wider px-2 py-1">
            NEW
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product._id);
          }}
          className={cn(
            "absolute bottom-2 right-2 p-2 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100",
            inWishlist ? "bg-red-50 text-red-500" : "bg-white/90 hover:bg-white"
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </button>
      </Link>

      {/* Info */}
      <div className="space-y-1">
        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}

        <h3 className="text-xs font-medium tracking-wide truncate">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{product.price.toFixed(2)} AED</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.compareAtPrice.toFixed(2)} AED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
