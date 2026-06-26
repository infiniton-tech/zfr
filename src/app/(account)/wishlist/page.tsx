import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  return (
    <div>
      <h2 className="text-sm font-medium tracking-wide mb-6">MY WISHLIST</h2>
      <div className="border border-border p-12 text-center">
        <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty</p>
        <Link
          href="/woman"
          className="inline-block bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black/90 transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}
