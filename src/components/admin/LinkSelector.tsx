"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link2, Check, FileText, ExternalLink, HelpCircle, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  gender: string;
  parentId?: string | null;
  isActive: boolean;
}

interface LinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  suggestLabel?: string; // e.g. form.label ("Punjabi") - used to prefill the extras search
}

const DEPARTMENTS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
];

const SYSTEM_PAGES = [
  { name: "Home Page", path: "/", description: "Storefront homepage" },
  { name: "Women's Department", path: "/woman", description: "All women's clothing and categories" },
  { name: "Men's Department", path: "/man", description: "All men's clothing and categories" },
  { name: "Kids' Department", path: "/kids", description: "All kids' clothing and categories" },
  { name: "Search Page", path: "/search", description: "General search and filter screen" },
  { name: "Looks Book", path: "/looks", description: "Curated styles and shoppable looks" },
  { name: "Shopping Cart", path: "/cart", description: "Customer shopping cart" },
  { name: "Checkout", path: "/checkout", description: "Direct order checkout page" },
];

const CATEGORY_PATH_RE = /^\/(woman|man|kids|unisex)\/([a-z0-9-]+)\/?$/i;

const selectClass =
  "w-full border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50 disabled:cursor-not-allowed";

export function LinkSelector({
  value,
  onChange,
  placeholder = "e.g. /woman/tops or /search?q=...",
  className = "",
  label,
  suggestLabel,
}: LinkSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cascading picker state
  const [gender, setGender] = useState("");
  const [topId, setTopId] = useState("");
  const [subId, setSubId] = useState("");

  // Extras dialog (system pages + custom URL) for edge cases
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [extrasTab, setExtrasTab] = useState<"system" | "custom">("system");
  const [customUrl, setCustomUrl] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/v1/categories?all=true");
        if (!res.ok) throw new Error("Failed to load categories");
        const json = await res.json();
        if (!cancelled) setCategories(json.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load categories for the link picker");
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pathFor = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c._id === id);
      return cat ? `/${cat.gender}/${cat.slug}` : "";
    },
    [categories]
  );

  function getCategoryHierarchyName(cat: Category): string {
    if (!cat.parentId) return cat.name;
    const parent = categories.find((c) => c._id === cat.parentId);
    if (!parent) return cat.name;
    return `${getCategoryHierarchyName(parent)} > ${cat.name}`;
  }

  // Keep the picker in sync with `value` whenever it changes from outside (e.g. loading an
  // existing record to edit). Derived during render (React's sanctioned "adjusting state when
  // a prop changes" pattern) rather than in an effect, guarded so it only runs once per distinct
  // value and never fights our own onChange calls.
  const [lastSyncedValue, setLastSyncedValue] = useState<string | null>(null);
  if (!loadingCategories && value !== lastSyncedValue) {
    const builtLink = subId ? pathFor(subId) : topId ? pathFor(topId) : "";
    if (value !== builtLink) {
      const match = value?.match(CATEGORY_PATH_RE);
      const slug = match?.[2];
      const cat = slug ? categories.find((c) => c.slug === slug) : undefined;

      if (cat) {
        setGender(cat.gender);
        setTopId(cat.parentId ? cat.parentId : cat._id);
        setSubId(cat.parentId ? cat._id : "");
      } else {
        setGender("");
        setTopId("");
        setSubId("");
      }
    }
    setLastSyncedValue(value);
  }

  const topCategories = useMemo(
    () => categories.filter((c) => !c.parentId && c.gender === gender),
    [categories, gender]
  );
  const subCategories = useMemo(
    () => categories.filter((c) => c.parentId === topId),
    [categories, topId]
  );

  const handleGenderChange = (g: string) => {
    setGender(g);
    setTopId("");
    setSubId("");
    onChange("");
  };

  const handleTopChange = (id: string) => {
    setTopId(id);
    setSubId("");
    onChange(id ? pathFor(id) : "");
  };

  const handleSubChange = (id: string) => {
    setSubId(id);
    onChange(id ? pathFor(id) : pathFor(topId));
  };

  const handleSelectExtra = (url: string) => {
    onChange(url);
    setExtrasOpen(false);
    toast.success(`Link updated to: ${url}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      toast.error("Please enter a valid link");
      return;
    }
    handleSelectExtra(customUrl.trim());
  };

  const resolvedLabel = (() => {
    if (!value) return "No link selected";
    const match = value.match(CATEGORY_PATH_RE);
    const slug = match?.[2];
    const cat = slug ? categories.find((c) => c.slug === slug) : undefined;
    if (cat) return `Category: ${getCategoryHierarchyName(cat)}`;
    const sysPage = SYSTEM_PAGES.find((p) => p.path === value);
    if (sysPage) return `Page: ${sysPage.name}`;
    if (value.startsWith("/search")) return `Search link: ${value}`;
    return `Custom URL: ${value}`;
  })();

  const filteredSystemPages = SYSTEM_PAGES.filter((p) => {
    const q = pageSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const openExtras = () => {
    setCustomUrl(value);
    setPageSearch(suggestLabel || "");
    setExtrasTab("system");
    setExtrasOpen(true);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-muted-foreground">{label}</label>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={gender}
          onChange={(e) => handleGenderChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Department...</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <select
          value={topId}
          onChange={(e) => handleTopChange(e.target.value)}
          disabled={!gender || loadingCategories}
          className={selectClass}
        >
          <option value="">{gender ? "Select category..." : "Pick department first"}</option>
          {topCategories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={subId}
          onChange={(e) => handleSubChange(e.target.value)}
          disabled={!topId}
          className={selectClass}
        >
          <option value="">{topId ? "No subcategory (use category)" : "Pick category first"}</option>
          {subCategories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loadingCategories && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading categories...
        </div>
      )}
      {!loadingCategories && gender && topCategories.length === 0 && (
        <p className="text-[11px] text-amber-600">No categories exist yet for {gender}. Add one under Categories, or use &quot;Other link options&quot; below.</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between flex-1 text-[11px] bg-muted/30 border border-border/60 px-2.5 py-1.5 rounded-sm min-w-0">
          <span className="text-muted-foreground flex items-center gap-1 truncate">
            {value ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <Link2 className="h-3 w-3 opacity-50 shrink-0" />}
            <span className="truncate">{resolvedLabel}</span>
          </span>
          {value && <span className="font-mono text-muted-foreground shrink-0 select-all ml-2">{value}</span>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openExtras} className="shrink-0 h-9 text-xs">
          <MoreHorizontal className="h-3.5 w-3.5 mr-1" />
          Other link options
        </Button>
      </div>

      <Dialog open={extrasOpen} onOpenChange={setExtrasOpen}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-5 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Link2 className="w-4 h-4" />
              Other link options
            </DialogTitle>
          </DialogHeader>

          <div className="flex border-b text-xs font-medium">
            <button
              onClick={() => setExtrasTab("system")}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                extrasTab === "system" ? "border-black text-black font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Site Pages
              </div>
            </button>
            <button
              onClick={() => setExtrasTab("custom")}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                extrasTab === "custom" ? "border-black text-black font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Custom URL
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
            {extrasTab === "system" && (
              <div className="space-y-2">
                <Input
                  placeholder="Search pages..."
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="space-y-1.5">
                  {filteredSystemPages.map((page) => {
                    const isSelected = value === page.path;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelectExtra(page.path)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          isSelected ? "bg-neutral-50 border-black font-medium" : "hover:bg-muted/50 border-border"
                        }`}
                      >
                        <div className="space-y-0.5 pr-4">
                          <div className="text-xs font-semibold">{page.name}</div>
                          <div className="text-[11px] text-muted-foreground">{page.description}</div>
                          <code className="text-[10px] text-zinc-500 font-mono block pt-0.5">{page.path}</code>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-black shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredSystemPages.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-xs">No matching page.</div>
                  )}
                </div>
              </div>
            )}

            {extrasTab === "custom" && (
              <form onSubmit={handleCustomSubmit} className="space-y-3 py-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Custom URL or path</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={placeholder}
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
                <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    When should I use this?
                  </div>
                  <p>
                    Only for links the department/category/subcategory picker can&apos;t build, e.g. a product page like{" "}
                    <code className="font-mono bg-white/60 px-1 font-bold">/product/some-item</code> or a search query{" "}
                    <code className="font-mono bg-white/60 px-1 font-bold">/search?q=punjabi</code>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
