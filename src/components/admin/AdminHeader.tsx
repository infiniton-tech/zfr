"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/hero-sections", label: "Hero Sections" },
  { href: "/admin/nav-items", label: "Navigation" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/parcel", label: "Parcel" },
];

export function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/admin" className="flex items-baseline gap-2 text-lg font-bold tracking-tight">
          <Logo className="h-5" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Admin</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <User className="h-4 w-4 mr-2" />
            Store
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/logout")}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
