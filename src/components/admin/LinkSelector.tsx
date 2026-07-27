"use client";

import { useState, useEffect, useCallback } from "react";
import { Link2, Search, Check, FileText, FolderTree, ShoppingBag, ExternalLink, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
  gender: string;
  parentId?: string | null;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  images: string[];
  gender: string;
}

interface LinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  suggestLabel?: string; // e.g. form.label ("Punjabi")
}

export function LinkSelector({
  value,
  onChange,
  placeholder = "Select or enter a storefront link...",
  className = "",
  label,
  suggestLabel,
}: LinkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"system" | "categories" | "products" | "custom">("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // System pages list
  const systemPages = [
    { name: "Home Page", path: "/", description: "Storefront homepage" },
    { name: "Women's Department", path: "/woman", description: "All women's clothing and categories" },
    { name: "Men's Department", path: "/man", description: "All men's clothing and categories" },
    { name: "Kids' Department", path: "/kids", description: "All kids' clothing and categories" },
    { name: "Search Page", path: "/search", description: "General search and filter screen" },
    { name: "Looks Book", path: "/looks", description: "Curated styles and shoppable looks" },
    { name: "Shopping Cart", path: "/cart", description: "Customer shopping cart" },
    { name: "Checkout", path: "/checkout", description: "Direct order checkout page" },
  ];

  // Smart suggestions derived from suggestLabel (e.g. "Punjabi")
  const getSmartSuggestions = useCallback(() => {
    if (!suggestLabel || !suggestLabel.trim()) return [];
    const clean = suggestLabel.trim();
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) return [];

    return [
      { label: `Men's ${clean}`, path: `/man/${slug}`, dept: "Man" },
      { label: `Women's ${clean}`, path: `/woman/${slug}`, dept: "Woman font-semibold" },
      { label: `Kids' ${clean}`, path: `/kids/${slug}`, dept: "Kids" },
      { label: `Search "${clean}"`, path: `/search?q=${encodeURIComponent(clean)}`, dept: "Search" },
    ];
  }, [suggestLabel]);

  const smartSuggestions = getSmartSuggestions();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/v1/categories?all=true");
      if (!res.ok) throw new Error("Failed to load categories");
      const json = await res.json();
      setCategories(json.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch categories for auto-linking");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch products (supports search)
  const fetchProducts = useCallback(async (query: string = "") => {
    setLoadingProducts(true);
    try {
      const url = query
        ? `/api/v1/products?limit=30&search=${encodeURIComponent(query)}`
        : "/api/v1/products?limit=30";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load products");
      const json = await res.json();
      setProducts(json.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch products for auto-linking");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchProducts("");
      setSearchQuery(suggestLabel || "");
      setCustomUrl(value);
    }
  }, [isOpen, value, suggestLabel, fetchCategories, fetchProducts]);

  // Debounced/Triggered search for products when tab is active
  useEffect(() => {
    if (isOpen && activeTab === "products") {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, activeTab, isOpen, fetchProducts]);

  // Resolve Category Path
  const getCategoryPath = (cat: Category) => {
    return `/${cat.gender}/${cat.slug}`;
  };

  // Helper to build hierarchy label
  const getCategoryHierarchyName = (cat: Category, allCats: Category[]): string => {
    if (!cat.parentId) return cat.name;
    const parent = allCats.find((c) => c._id === cat.parentId);
    if (!parent) return cat.name;
    return `${getCategoryHierarchyName(parent, allCats)} > ${cat.name}`;
  };

  // Selection Handler
  const handleSelect = (url: string) => {
    onChange(url);
    setIsOpen(false);
    toast.success(`Link updated to: ${url}`);
  };

  // Custom link submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      toast.error("Please enter a valid link");
      return;
    }
    handleSelect(customUrl.trim());
  };

  // Determine current link matching badge/label
  const getCurrentLinkLabel = () => {
    if (!value) return "No Link Selected";

    // 1. Check system pages
    const sysPage = systemPages.find((p) => p.path === value);
    if (sysPage) return `System: ${sysPage.name}`;

    // 2. Check categories
    const matchedCategory = categories.find((c) => getCategoryPath(c) === value || value.endsWith(`/${c.slug}`));
    if (matchedCategory) {
      const hierarchy = getCategoryHierarchyName(matchedCategory, categories);
      return `Category: ${hierarchy} (${value})`;
    }

    // 3. Check products
    if (value.startsWith("/product/")) {
      const slug = value.replace("/product/", "");
      const matchedProd = products.find((p) => p.slug === slug);
      if (matchedProd) return `Product: ${matchedProd.name}`;
      return `Product Path: ${value}`;
    }

    if (value.startsWith("/search")) return `Search Query: ${value}`;

    return `Custom URL: ${value}`;
  };

  // Filter categories by search
  const filteredCategories = categories.filter((cat) => {
    const hierarchy = getCategoryHierarchyName(cat, categories).toLowerCase();
    const gender = cat.gender.toLowerCase();
    const path = getCategoryPath(cat).toLowerCase();
    const query = searchQuery.toLowerCase();

    return hierarchy.includes(query) || gender.includes(query) || path.includes(query) || cat.slug.includes(query);
  });

  // Filter system pages by search
  const filteredSystemPages = systemPages.filter((page) => {
    const name = page.name.toLowerCase();
    const desc = page.description.toLowerCase();
    const path = page.path.toLowerCase();
    const query = searchQuery.toLowerCase();

    return name.includes(query) || desc.includes(query) || path.includes(query);
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-muted-foreground">{label}</label>}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-10 font-mono text-xs"
          />
          <Link2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 shrink-0 h-9"
        >
          <Search className="h-3.5 w-3.5" />
          Browse Links
        </Button>
      </div>

      {/* Quick Suggestions Pills (when suggestLabel like "Punjabi" is present) */}
      {smartSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-muted-foreground font-medium flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Suggested for "{suggestLabel}":
          </span>
          {smartSuggestions.map((item) => {
            const isSelected = value === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleSelect(item.path)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-muted/40 hover:bg-black hover:text-white border-border text-foreground"
                }`}
              >
                {item.label} <span className="opacity-70 text-[9px]">({item.path})</span>
              </button>
            );
          })}
        </div>
      )}

      {value && (
        <div className="flex items-center justify-between text-[11px] bg-muted/30 border border-border/60 px-2.5 py-1.5 rounded-sm">
          <span className="text-muted-foreground flex items-center gap-1 truncate">
            <span className="font-semibold text-foreground shrink-0">Resolved:</span>
            <span className="truncate">{getCurrentLinkLabel()}</span>
          </span>
          <span className="font-mono text-muted-foreground shrink-0 select-all ml-2">{value}</span>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-5 pb-3 border-b">
            <DialogTitle className="flex items-center justify-between text-lg pr-6">
              <span className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-black" />
                Link Selection Helper
              </span>
              {suggestLabel && (
                <span className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-normal flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Label: "{suggestLabel}"
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Search bar inside dialog */}
          <div className="p-4 pb-2 border-b bg-muted/10 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  activeTab === "products"
                    ? "Search products dynamically..."
                    : "Search categories, pages, or type keyword..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Smart suggestions bar inside modal */}
            {smartSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                <span className="text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick Apply:
                </span>
                {smartSuggestions.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleSelect(item.path)}
                    className="px-2 py-0.5 bg-white hover:bg-black hover:text-white border border-border rounded text-[10px] font-mono transition-colors"
                  >
                    {item.label} <code className="text-[9px] opacity-70">({item.path})</code>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs header */}
          <div className="flex border-b text-xs font-medium">
            <button
              onClick={() => { setActiveTab("system"); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === "system"
                  ? "border-black text-black font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Pages
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("categories"); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === "categories"
                  ? "border-black text-black font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                Categories ({filteredCategories.length})
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("products"); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-black text-black font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Products
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("custom"); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === "custom"
                  ? "border-black text-black font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Custom Link
              </div>
            </button>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[45vh] min-h-[30vh]">
            {activeTab === "system" && (
              <div className="space-y-1.5">
                {filteredSystemPages.length > 0 ? (
                  filteredSystemPages.map((page) => {
                    const isSelected = value === page.path;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelect(page.path)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-neutral-50 border-black font-medium"
                            : "hover:bg-muted/50 border-border"
                        }`}
                      >
                        <div className="space-y-0.5 pr-4">
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            {page.name}
                            {isSelected && <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-mono font-normal">Active</span>}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{page.description}</div>
                          <code className="text-[10px] text-zinc-500 font-mono block pt-1">{page.path}</code>
                        </div>
                        <div className="shrink-0">
                          {isSelected ? (
                            <Check className="h-4 w-4 text-black" />
                          ) : (
                            <Link2 className="h-3.5 w-3.5 text-muted-foreground opacity-30 hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-xs">No matching system pages.</div>
                )}
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-2">
                {loadingCategories && (
                  <div className="flex justify-center items-center py-10 gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Fetching category database...
                  </div>
                )}

                {!loadingCategories && filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const defaultPath = getCategoryPath(cat);
                    const isSelected = value === defaultPath;
                    const hierarchy = getCategoryHierarchyName(cat, categories);
                    const manPath = `/man/${cat.slug}`;
                    const womanPath = `/woman/${cat.slug}`;
                    const kidsPath = `/kids/${cat.slug}`;
                    const searchPath = `/search?q=${encodeURIComponent(cat.name)}`;

                    return (
                      <div
                        key={cat._id}
                        className={`p-3 rounded-lg border transition-all space-y-2 ${
                          isSelected
                            ? "bg-neutral-50 border-black"
                            : "hover:bg-muted/30 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold flex items-center flex-wrap gap-1.5">
                              {hierarchy}
                              <span className="text-[10px] uppercase font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-semibold">
                                {cat.gender}
                              </span>
                              {isSelected && <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-mono font-normal">Active</span>}
                            </div>
                            <code className="text-[10px] text-zinc-500 font-mono block">Default: {defaultPath}</code>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSelect(defaultPath)}
                            className="text-xs bg-black text-white hover:bg-neutral-800"
                          >
                            Select Default
                          </Button>
                        </div>

                        {/* Department variant buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/40 text-[10px]">
                          <span className="text-muted-foreground font-medium">Department links:</span>
                          <button
                            type="button"
                            onClick={() => handleSelect(manPath)}
                            className={`px-2 py-0.5 rounded border font-mono ${value === manPath ? "bg-black text-white font-bold" : "bg-white hover:bg-black hover:text-white"}`}
                          >
                            Men ({manPath})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelect(womanPath)}
                            className={`px-2 py-0.5 rounded border font-mono ${value === womanPath ? "bg-black text-white font-bold" : "bg-white hover:bg-black hover:text-white"}`}
                          >
                            Women ({womanPath})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelect(kidsPath)}
                            className={`px-2 py-0.5 rounded border font-mono ${value === kidsPath ? "bg-black text-white font-bold" : "bg-white hover:bg-black hover:text-white"}`}
                          >
                            Kids ({kidsPath})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelect(searchPath)}
                            className={`px-2 py-0.5 rounded border font-mono ${value === searchPath ? "bg-black text-white font-bold" : "bg-white hover:bg-black hover:text-white"}`}
                          >
                            Search ({searchPath})
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  !loadingCategories && (
                    <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                      <p>{searchQuery ? `No matching category found for "${searchQuery}".` : "No categories defined in your shop."}</p>
                      {searchQuery && (
                        <div className="flex justify-center gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelect(`/man/${searchQuery.toLowerCase().replace(/\s+/g, "-")}`)}
                            className="text-xs"
                          >
                            Use /man/{searchQuery.toLowerCase().replace(/\s+/g, "-")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelect(`/woman/${searchQuery.toLowerCase().replace(/\s+/g, "-")}`)}
                            className="text-xs"
                          >
                            Use /woman/{searchQuery.toLowerCase().replace(/\s+/g, "-")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelect(`/search?q=${encodeURIComponent(searchQuery)}`)}
                            className="text-xs"
                          >
                            Search Link
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-1.5">
                {loadingProducts && products.length === 0 && (
                  <div className="flex justify-center items-center py-10 gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Fetching product catalog...
                  </div>
                )}

                {!loadingProducts && products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {products.map((prod) => {
                      const path = `/product/${prod.slug}`;
                      const isSelected = value === path;
                      const thumb = prod.images?.[0];

                      return (
                        <button
                          key={prod._id}
                          onClick={() => handleSelect(path)}
                          className={`w-full text-left p-2 rounded-lg border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "bg-neutral-50 border-black font-medium"
                              : "hover:bg-muted/50 border-border"
                          }`}
                        >
                          <div className="relative w-10 h-12 bg-muted rounded overflow-hidden shrink-0 border border-border/50">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={prod.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted text-[10px]">
                                No pic
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                              <span className="truncate">{prod.name}</span>
                              <span className="text-[9px] font-mono text-muted-foreground shrink-0 font-normal">({prod.sku})</span>
                              {isSelected && <span className="text-[10px] bg-black text-white px-1 py-0.2 rounded font-mono font-normal shrink-0">Active</span>}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                              <code className="font-mono text-zinc-500 truncate mr-2">{path}</code>
                              <span className="font-bold text-black shrink-0">{formatPrice(prod.price)}</span>
                            </div>
                          </div>
                          <div className="shrink-0 px-1">
                            {isSelected ? (
                              <Check className="h-4 w-4 text-black" />
                            ) : (
                              <Link2 className="h-3.5 w-3.5 text-muted-foreground opacity-30" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  !loadingProducts && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      {searchQuery ? "No matching products found." : "No products found in your database."}
                    </div>
                  )
                )}

                {loadingProducts && products.length > 0 && (
                  <div className="text-center py-2 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating results...
                  </div>
                )}
              </div>
            )}

            {activeTab === "custom" && (
              <form onSubmit={handleCustomSubmit} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Custom URL or Path</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. /man/punjabi or /woman/punjabi or /search?q=punjabi"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="font-mono text-xs"
                      required
                    />
                    <Button type="submit" className="bg-black hover:bg-black/90 text-white shrink-0">
                      Apply
                    </Button>
                  </div>
                </div>

                {suggestLabel && (
                  <div className="space-y-1.5 border-t pt-3">
                    <label className="text-xs font-semibold text-foreground">Suggested paths for "{suggestLabel}":</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelect(`/man/${suggestLabel.toLowerCase().replace(/\s+/g, "-")}`)}
                        className="text-xs font-mono"
                      >
                        /man/{suggestLabel.toLowerCase().replace(/\s+/g, "-")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelect(`/woman/${suggestLabel.toLowerCase().replace(/\s+/g, "-")}`)}
                        className="text-xs font-mono"
                      >
                        /woman/{suggestLabel.toLowerCase().replace(/\s+/g, "-")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelect(`/search?q=${encodeURIComponent(suggestLabel)}`)}
                        className="text-xs font-mono"
                      >
                        /search?q={suggestLabel}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    When should I use a custom link?
                  </div>
                  <p>
                    Use this for specific paths like <code className="font-mono bg-white/60 px-1 font-bold">/man/punjabi</code>, <code className="font-mono bg-white/60 px-1 font-bold">/woman/punjabi</code>, or search queries <code className="font-mono bg-white/60 px-1 font-bold">/search?q=punjabi</code>.
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="p-3 border-t bg-muted/30 text-[10px] text-muted-foreground text-center">
            Tip: You can always type or paste directly into the main input field if you prefer.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
