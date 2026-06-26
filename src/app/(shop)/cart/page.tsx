"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/tracker";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent("checkout_start", undefined, {
      itemsCount: items.length,
      totalPrice: getTotalPrice(),
    });
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="pt-[56px] min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-medium mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Add some items to get started</p>
        <Link
          href="/woman"
          className="bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black/90 transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        <h1 className="text-lg font-medium tracking-wide mb-8">SHOPPING BAG ({items.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 pb-6 border-b border-border">
                <div className="relative w-24 h-32 bg-muted shrink-0 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.color && `${item.color} / `}{item.size && `Size ${item.size}`}
                    </p>
                    <p className="text-sm font-semibold mt-2">{item.price.toFixed(2)} AED</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-muted p-6 h-fit">
            <h2 className="text-sm font-medium tracking-wide mb-6">ORDER SUMMARY</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{getTotalPrice().toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold mt-4 pt-4 border-t border-border">
              <span>Total</span>
              <span>{getTotalPrice().toFixed(2)} AED</span>
            </div>
            <button
              onClick={handleCheckout}
              className="block w-full mt-6 bg-black text-white text-center text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors cursor-pointer"
            >
              CHECKOUT
            </button>
            <Link
              href="/woman"
              className="block w-full mt-3 text-center text-xs tracking-[0.2em] py-3 border border-border hover:border-foreground transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
