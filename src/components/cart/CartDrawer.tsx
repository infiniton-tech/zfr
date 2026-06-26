"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
  const total = getTotalPrice();
  const count = getTotalItems();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-1 hover:opacity-70 transition-opacity relative" aria-label="Cart">
        <ShoppingBag className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-sm font-medium tracking-wide">SHOPPING BAG ({count})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-6">Your cart is empty</p>
            <Link
              href="/woman"
              onClick={() => setOpen(false)}
              className="bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black/90 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative w-20 h-24 bg-muted shrink-0 overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-medium">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.color && `${item.color} / `}{item.size && `Size ${item.size}`}
                      </p>
                      <p className="text-xs font-semibold mt-1">{item.price.toFixed(2)} AED</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{total.toFixed(2)} AED</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block w-full bg-black text-white text-center text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors"
              >
                CHECKOUT
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-xs tracking-[0.2em] py-3 border border-border hover:border-foreground transition-colors"
              >
                VIEW CART
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
