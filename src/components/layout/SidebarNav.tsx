"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function SidebarNav({ onClose }: SidebarNavProps) {
  const [genders, setGenders] = useState<Array<{ label: string; value: string }>>([]);
  const [activeGender, setActiveGender] = useState<string>("woman");
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGenders() {
      try {
        const res = await fetch("/api/v1/nav-items?position=header-main");
        const json = await res.json();
        const items = json.data || [];
        if (items.length > 0) {
          const mapped = items.map((item: any) => ({
            label: item.label.toUpperCase(),
            value: item.href.replace(/^\//, ""),
          }));
          setGenders(mapped);
          if (mapped.length > 0) {
            setActiveGender(mapped[0].value);
          }
        } else {
          const catRes = await fetch("/api/v1/categories");
          const catJson = await catRes.json();
          const categories = catJson.data || [];
          const uniqueGenders = Array.from(new Set(categories.map((c: any) => c.gender))) as string[];
          const mapped = uniqueGenders.map((gender) => ({
            label: gender.toUpperCase(),
            value: gender,
          }));
          setGenders(mapped);
          if (mapped.length > 0) {
            setActiveGender(mapped[0].value);
          }
        }
      } catch {
        setGenders([]);
      }
    }
    fetchGenders();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/v1/categories?gender=${activeGender}`);
        const json = await res.json();
        setCategories(json.data || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    if (activeGender) {
      fetchCategories();
    }
  }, [activeGender]);

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
        <div className="flex items-center gap-4 text-xs font-medium tracking-wider">
          {genders.map((g) => (
            <button
              key={g.value}
              onClick={() => {
                setActiveGender(g.value);
                setSubMenuOpen(false);
              }}
              className={`pb-0.5 border-b-2 transition-colors ${
                activeGender === g.value
                  ? "border-black text-black"
                  : "border-transparent text-muted-foreground hover:text-black"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="relative">
          {/* Main Menu */}
          <nav className="py-2">
            {loading ? (
              <div className="px-6 py-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => openSubmenu(cat)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm tracking-wide hover:bg-muted/50 transition-colors text-foreground"
                >
                  <span>{cat.name.toUpperCase()}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))
            )}
          </nav>

          {/* Submenu Overlay */}
          {subMenuOpen && (
            <div className="absolute inset-0 bg-white z-10 animate-in slide-in-from-right duration-300">
              <div className="flex items-center px-4 h-[56px] border-b border-border">
                <button
                  onClick={() => setSubMenuOpen(false)}
                  className="flex items-center gap-2 text-sm hover:opacity-70"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span className="uppercase tracking-wide">Back</span>
                </button>
              </div>
              <div className="px-6 py-3 border-b border-border">
                <span className="text-xs text-muted-foreground tracking-wider">{activeCategory?.name.toUpperCase()}</span>
              </div>
              <nav className="py-2">
                {subcategories.length === 0 ? (
                  <Link
                    href={`/${activeGender}/${activeCategory?.slug}`}
                    onClick={onClose}
                    className="block px-6 py-3 text-sm tracking-wide hover:bg-muted/50 transition-colors"
                  >
                    View All {activeCategory?.name}
                  </Link>
                ) : (
                  subcategories.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/${activeGender}/${sub.slug}`}
                      onClick={onClose}
                      className="block px-6 py-3 text-sm tracking-wide hover:bg-muted/50 transition-colors"
                    >
                      {sub.name.toUpperCase()}
                    </Link>
                  ))
                )}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
