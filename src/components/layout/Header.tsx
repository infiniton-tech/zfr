"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, User, LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SearchModal } from "@/components/shared/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  _id: string;
  label: string;
  href: string;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([
    { _id: "1", label: "Woman", href: "/woman" },
    { _id: "2", label: "Man", href: "/man" },
    { _id: "3", label: "Kids", href: "/kids" },
  ]);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await fetch("/api/v1/nav-items?position=header-main");
        const json = await res.json();
        const items = json.data || [];
        if (items.length === 0) {
          setNavItems([
            { _id: "1", label: "Woman", href: "/woman" },
            { _id: "2", label: "Man", href: "/man" },
            { _id: "3", label: "Kids", href: "/kids" },
          ]);
        } else {
          setNavItems(items);
        }
      } catch {
        setNavItems([
          { _id: "1", label: "Woman", href: "/woman" },
          { _id: "2", label: "Man", href: "/man" },
          { _id: "3", label: "Kids", href: "/kids" },
        ]);
      }
    };
    fetchNav();
  }, []);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent text-white"
            : "bg-white/95 backdrop-blur-sm text-black shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between px-4 md:px-6 h-[56px]">
          {/* Left: Hamburger + Nav */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger
                className="p-1 hover:opacity-70 transition-opacity"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SidebarNav onClose={() => setSidebarOpen(false)} />
            </Sheet>

            <nav className="hidden md:flex items-center gap-4 text-xs font-medium tracking-wider uppercase">
              {navItems.map((item) => (
                <Link key={item._id} href={item.href} className="hover:opacity-70 transition-opacity">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-bold tracking-[0.3em] uppercase">ZFR</h1>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="p-1 hover:opacity-70 transition-opacity" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>

            {status === "authenticated" && session?.user ? (
              <div className="flex items-center gap-1.5 md:gap-3">
                <Link href="/profile" className="hidden md:inline text-xs font-medium tracking-wider hover:opacity-70 transition-opacity">
                  {session.user.name}
                </Link>
                <Link href="/profile" className="md:hidden p-1 hover:opacity-70 transition-opacity" aria-label="Profile">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1 hover:opacity-70 transition-opacity"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="p-1 hover:opacity-70 transition-opacity" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            )}

            <CartDrawer />
          </div>
        </div>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
