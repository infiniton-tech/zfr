"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";

import { trackEvent } from "@/lib/tracker";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showLabel?: boolean;
}

export function WishlistButton({ productId, className, showLabel = false }: WishlistButtonProps) {
  const { toggle, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleToggle = () => {
    toggle(productId);
    trackEvent(inWishlist ? "wishlist_remove" : "wishlist_add", productId);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-center gap-2 p-4 border border-border transition-colors",
        inWishlist ? "border-red-200 bg-red-50 text-red-500" : "hover:border-black",
        className
      )}
      aria-label="Add to wishlist"
    >
      <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
      {showLabel && <span className="text-xs tracking-wider">{inWishlist ? "SAVED" : "WISHLIST"}</span>}
    </button>
  );
}
