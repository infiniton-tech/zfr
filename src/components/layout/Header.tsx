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
import { normalizeHref } from "@/lib/utils";

interface NavItem {
  _id: string;
  label: string;
  href: string;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session, status } = useSession();

  // Extract gender from the first path segment if it matches one of the departments
  const pathSegments = pathname.split("/").filter(Boolean);
  const activeGender = ["woman", "man", "kids"].includes(pathSegments[0]) ? pathSegments[0] : null;

  useEffect(() => {
    // Force re-render after hydration to fix transparent navbar on home page
    setForceUpdate((n) => n + 1);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavItems = async () => {
      if (activeGender) {
        try {
          const res = await fetch(`/api/v1/categories?gender=${activeGender}`);
          const json = await res.json();
          const categories = json.data || [];
          const mapped = categories.map((cat: any) => ({
            _id: cat._id,
            label: cat.name,
            href: `/${activeGender}/${cat.slug}`,
          }));
          setNavItems(mapped);
        } catch {
          setNavItems([]);
        }
      } else {
        try {
          const res = await fetch("/api/v1/nav-items?position=header-main");
          const json = await res.json();
          const items = json.data || [];
          if (items.length > 0) {
            setNavItems(items);
          } else {
            const catRes = await fetch("/api/v1/categories");
            const catJson = await catRes.json();
            const categories = catJson.data || [];
            const genders = Array.from(new Set(categories.map((c: any) => c.gender))) as string[];
            const mapped = genders.map((gender) => ({
              _id: gender,
              label: gender.charAt(0).toUpperCase() + gender.slice(1),
              href: `/${gender}`,
            }));
            setNavItems(mapped);
          }
        } catch {
          setNavItems([]);
        }
      }
    };
    fetchNavItems();
  }, [activeGender]);

  const isTransparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent text-white border-none shadow-none"
            : "bg-white/95 backdrop-blur-sm text-black shadow-sm border-b border-neutral-100"
        }`}
      >
        {/* Mobile Header Layout */}
        <div className="flex md:hidden items-center justify-between px-4 h-[56px] w-full">
          {/* Left: Search Trigger (icon in a circle container) */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center focus:outline-none ${
              isTransparent
                ? "bg-white/20 hover:bg-white/30 text-white"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center justify-center" aria-label="ZFR home">
            <img 
              src={isTransparent ? "/logo-white-new.png" : "/logoo.png"} 
              alt="ZFR" 
              className="h-14 w-auto transition-all duration-300" 
            />
          </Link>

          {/* Right: Hamburger Menu (opens SidebarNav sheet) */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger
              className={`p-2 hover:opacity-75 transition-opacity focus:outline-none ${
                isTransparent ? "text-white" : "text-neutral-800"
              }`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SidebarNav onClose={() => setSidebarOpen(false)} />
          </Sheet>
        </div>

        {/* Desktop Header Layout */}
        <div className="hidden md:flex items-center justify-between px-6 h-[56px]">
          {/* Left: Hamburger + Nav */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger
                className={`p-1 hover:opacity-70 transition-opacity ${
                  isTransparent ? "text-white" : "text-black"
                }`}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SidebarNav onClose={() => setSidebarOpen(false)} />
            </Sheet>

            <nav className={`hidden md:flex items-center gap-4 text-xs font-medium tracking-wider uppercase ${
              isTransparent ? "text-white" : "text-black"
            }`}>
              {navItems.map((item) => (
                <Link key={item._id} href={normalizeHref(item.href)} className="hover:opacity-70 transition-opacity">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="ZFR home">
            <h1>
              <img
                src={isTransparent ? "/logo-white-new.png" : "/logoo.png"}
                alt="ZFR"
                className="h-16 w-auto transition-all duration-300"
              />
            </h1>
          </Link>

          {/* Right: Icons */}
          <div className={`flex items-center gap-3 ${isTransparent ? "text-white" : "text-black"}`}>
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
