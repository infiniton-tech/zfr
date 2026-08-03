"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Phone, Home, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const CONTACT_DEFAULTS = {
  contact_phone: "+880 1616-764344",
  contact_email: "zfr3611@gmail.com",
  contact_hours: "10:00 AM - 10:00 PM (Daily)",
};

export function BottomNav() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState(CONTACT_DEFAULTS);

  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  const total = getTotalPrice();
  const count = getTotalItems();

  useEffect(() => {
    setMounted(true);
    async function fetchContact() {
      try {
        const res = await fetch("/api/v1/store-settings");
        const json = await res.json();
        const settings: { key: string; value: string }[] = json.data || [];
        const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
        setContact({
          contact_phone: map.contact_phone || CONTACT_DEFAULTS.contact_phone,
          contact_email: map.contact_email || CONTACT_DEFAULTS.contact_email,
          contact_hours: map.contact_hours || CONTACT_DEFAULTS.contact_hours,
        });
      } catch {
        // keep defaults
      }
    }
    fetchContact();
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 h-[64px] flex items-center justify-around px-2 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe">
      
      {/* Category (Trigger Sidebar Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-neutral-600 hover:text-black transition-colors focus:outline-none">
          <Menu className="w-5 h-5 mb-0.5 text-neutral-800" />
          <span>Category</span>
        </SheetTrigger>
        <SidebarNav onClose={() => setSidebarOpen(false)} />
      </Sheet>

      {/* Contact (Trigger Contact Dialog/Popup) */}
      <button 
        onClick={() => setContactOpen(true)}
        className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-neutral-600 hover:text-black transition-colors focus:outline-none"
      >
        <Phone className="w-5 h-5 mb-0.5 text-neutral-800" />
        <span>Contact</span>
      </button>

      {/* Home (Central Black Brand Circle) */}
      <Link href="/" className="relative -top-3.5 flex flex-col items-center justify-center z-50">
        <div className="w-[56px] h-[56px] rounded-full bg-black flex flex-col items-center justify-center shadow-xl border-4 border-white hover:bg-neutral-800 active:scale-95 transition-all">
          <Home className="w-5 h-5 text-white" />
          <span className="text-[9px] font-bold text-white tracking-wider mt-0.5 leading-none uppercase">Home</span>
        </div>
      </Link>

      {/* Cart (Trigger Cart Sheet) */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetTrigger className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-neutral-600 hover:text-black transition-colors focus:outline-none relative">
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-neutral-800" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full animate-pulse">
                {count}
              </span>
            )}
          </div>
          <span>Cart ({count})</span>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 z-[100]">
          <SheetHeader className="px-6 py-4 border-b border-neutral-100">
            <SheetTitle className="text-sm font-medium tracking-wide">SHOPPING BAG ({count})</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mb-4" />
              <p className="text-sm text-neutral-500 mb-6">Your cart is empty</p>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-black text-white text-xs font-semibold tracking-[0.2em] px-8 py-3 hover:bg-neutral-800 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden rounded-sm">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-medium text-neutral-800">{item.name}</h3>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {item.color && `${item.color} / `}{item.size && `Size ${item.size}`}
                        </p>
                        <p className="text-xs font-bold text-black mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-neutral-500" />
                          </button>
                          <span className="px-2 text-xs font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block w-full bg-black text-white text-center text-xs font-semibold tracking-[0.2em] py-4 hover:bg-neutral-800 transition-colors"
                >
                  CHECKOUT
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="block w-full text-center text-xs tracking-[0.2em] py-3 border border-neutral-200 hover:border-black transition-colors"
                >
                  VIEW CART
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Login / Profile */}
      <Link 
        href={session ? "/profile" : "/login"}
        className="flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium text-neutral-500 hover:text-black transition-colors focus:outline-none"
      >
        <User className="w-5 h-5 mb-0.5 text-neutral-700" />
        <span>{session ? "Profile" : "Login"}</span>
      </Link>

      {/* Contact Info Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-neutral-100 shadow-2xl relative">
            <h3 className="text-base font-bold text-neutral-900 mb-1 uppercase tracking-wider">ZFR Contact & Social</h3>
            <p className="text-xs text-neutral-500 mb-4">Official Customer Support & Social Channels</p>
            
            <div className="space-y-3 text-xs text-neutral-700">
              <a
                href="https://wa.me/8801616764344"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg text-emerald-800 font-medium hover:bg-emerald-100 transition-colors border border-emerald-200/60"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold">Chat on WhatsApp</div>
                  <div className="text-[10px] text-emerald-700">+880 1616-764344</div>
                </div>
              </a>

              <a
                href="mailto:zfr3611@gmail.com"
                className="flex items-center gap-3 p-2.5 bg-neutral-50 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors border border-neutral-200/60"
              >
                <span className="font-semibold text-neutral-500">Email:</span>
                <span className="font-medium text-neutral-900">zfr3611@gmail.com</span>
              </a>

              <div className="pt-2 flex items-center justify-between gap-2">
                <a
                  href="https://www.instagram.com/zfr.official_?igsh=aHl3dmxrNDlhbXZv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase shadow-sm"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/share/1BDhJYeRCu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 bg-blue-600 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase shadow-sm"
                >
                  Facebook
                </a>
              </div>
            </div>

            <button
              onClick={() => setContactOpen(false)}
              className="mt-5 w-full bg-black text-white py-2.5 text-xs font-semibold tracking-widest hover:bg-neutral-800 transition-colors uppercase rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
