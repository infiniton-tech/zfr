"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeHref } from "@/lib/utils";

interface SidebarNavProps {
  onClose: () => void;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  gender: string;
  sortOrder: number;
}

interface NavTab {
  label: string;
  href: string;
}

function parseTabHref(href: string) {
  const clean = normalizeHref(href).replace(/^\//, "");
  const parts = clean.split("/").filter(Boolean);
  const knownGenders = ["woman", "man", "kids", "unisex"];

  let gender = "man";
  let categorySlug: string | null = null;

  if (parts.length > 0) {
    if (knownGenders.includes(parts[0])) {
      gender = parts[0];
      if (parts.length > 1) {
        categorySlug = parts[1];
      }
    } else {
      categorySlug = parts[0];
    }
  }

  return { gender, categorySlug };
}

export function SidebarNav({ onClose }: SidebarNavProps) {
  const [tabs, setTabs] = useState<NavTab[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch top navigation tabs (Header Main items or Genders)
  useEffect(() => {
    async function fetchTopTabs() {
      try {
        const res = await fetch("/api/v1/nav-items?position=header-main");
        const json = await res.json();
        const items = json.data || [];
        if (items.length > 0) {
          const mapped: NavTab[] = items.map((item: any) => ({
            label: item.label.toUpperCase(),
            href: item.href,
          }));
          setTabs(mapped);
          setActiveTab(mapped[0]);
        } else {
          const catRes = await fetch("/api/v1/categories");
          const catJson = await catRes.json();
          const cats = catJson.data || [];
          const uniqueGenders = Array.from(new Set(cats.map((c: any) => c.gender))) as string[];
          const mapped: NavTab[] = (uniqueGenders.length > 0 ? uniqueGenders : ["woman", "man", "kids"]).map((g) => ({
            label: g.toUpperCase(),
            href: `/${g}`,
          }));
          setTabs(mapped);
          setActiveTab(mapped[0]);
        }
      } catch {
        setTabs([
          { label: "WOMAN", href: "/woman" },
          { label: "MAN", href: "/man" },
          { label: "KIDS", href: "/kids" },
        ]);
        setActiveTab({ label: "WOMAN", href: "/woman" });
      }
    }
    fetchTopTabs();
  }, []);

  // 2. Fetch categories for the selected tab
  useEffect(() => {
    async function fetchCategories() {
      if (!activeTab?.href) return;
      setLoading(true);
      try {
        const { gender } = parseTabHref(activeTab.href);
        const res = await fetch(`/api/v1/categories?gender=${gender}`);
        const json = await res.json();
        let list: Category[] = json.data || [];

        // Fallback: If no categories exist for this gender query, fetch all categories
        if (list.length === 0) {
          const allRes = await fetch("/api/v1/categories?all=true");
          const allJson = await allRes.json();
          list = allJson.data || [];
        }

        // Only show parent categories in main level
        const parents = list.filter((c) => !c.parentId);
        setCategories(parents.length > 0 ? parents : list);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [activeTab]);

  // 3. Open category submenu or subcategories
  const openSubmenu = async (category: Category) => {
    setActiveCategory(category);
    setSubMenuOpen(true);
    try {
      const res = await fetch(`/api/v1/categories/${category.slug}`);
      const json = await res.json();
      setSubcategories(json.data?.subcategories || []);
    } catch {
      setSubcategories([]);
    }
  };

  const { gender: activeGender } = activeTab ? parseTabHref(activeTab.href) : { gender: "man" };

  return (
    <SheetContent side="left" showCloseButton={false} className="w-full sm:max-w-[340px] p-0 border-r border-border">
      <SheetHeader className="sr-only">
        <SheetTitle>Navigation Menu</SheetTitle>
      </SheetHeader>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-[56px] border-b border-border">
        <button onClick={onClose} className="p-1 hover:opacity-70" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 text-xs font-medium tracking-wider overflow-x-auto scrollbar-none max-w-[240px]">
          {tabs.map((t) => {
            const isActive = activeTab?.href === t.href;
            return (
              <button
                key={t.href}
                onClick={() => {
                  setActiveTab(t);
                  setSubMenuOpen(false);
                }}
                className={`pb-0.5 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-black text-black font-bold"
                    : "border-transparent text-muted-foreground hover:text-black"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="relative">
          {/* Main Menu */}
          <nav className="py-2">
            {loading ? (
              <div className="px-6 py-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat) => {
                const categoryUrl = normalizeHref(`/${cat.gender || activeGender}/${cat.slug}`);

                return (
                  <div key={cat._id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
                    <Link
                      href={categoryUrl}
                      onClick={onClose}
                      className="text-sm font-medium tracking-wide text-foreground hover:text-black uppercase flex-1"
                    >
                      {cat.name}
                    </Link>
                    <button
                      onClick={() => openSubmenu(cat)}
                      className="p-1 text-muted-foreground hover:text-black"
                      aria-label={`View subcategories for ${cat.name}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-6 text-xs text-muted-foreground text-center space-y-3">
                <p>No categories found under this section.</p>
                {activeTab && (
                  <Link
                    href={normalizeHref(activeTab.href)}
                    onClick={onClose}
                    className="inline-block px-4 py-2 bg-black text-white text-xs rounded font-medium"
                  >
                    View {activeTab.label} Page
                  </Link>
                )}
              </div>
            )}
          </nav>

          {/* Submenu Overlay */}
          {subMenuOpen && (
            <div className="absolute inset-0 bg-white z-10 animate-in slide-in-from-right duration-300 min-h-full">
              <div className="flex items-center px-4 h-[56px] border-b border-border">
                <button
                  onClick={() => setSubMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span className="uppercase tracking-wide">Back</span>
                </button>
              </div>
              <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground tracking-wider uppercase">
                  {activeCategory?.name}
                </span>
                {activeCategory && (
                  <Link
                    href={normalizeHref(`/${activeCategory.gender || activeGender}/${activeCategory.slug}`)}
                    onClick={onClose}
                    className="text-[10px] text-black font-semibold underline uppercase"
                  >
                    View All
                  </Link>
                )}
              </div>
              <nav className="py-2">
                {subcategories.length === 0 ? (
                  <Link
                    href={normalizeHref(`/${activeCategory?.gender || activeGender}/${activeCategory?.slug}`)}
                    onClick={onClose}
                    className="block px-6 py-3 text-sm tracking-wide hover:bg-muted/50 transition-colors"
                  >
                    View All {activeCategory?.name}
                  </Link>
                ) : (
                  subcategories.map((sub) => {
                    const subUrl = normalizeHref(`/${sub.gender || activeCategory?.gender || activeGender}/${sub.slug}`);
                    return (
                      <Link
                        key={sub._id}
                        href={subUrl}
                        onClick={onClose}
                        className="block px-6 py-3 text-sm tracking-wide hover:bg-muted/50 transition-colors"
                      >
                        {sub.name.toUpperCase()}
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
