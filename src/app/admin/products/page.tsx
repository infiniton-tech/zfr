"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Image from "next/image";
import { ImageUploadManager } from "@/components/admin/ImageUploadManager";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  gender: string;
  categoryIds: string[];
  isTrending: boolean;
  isNewArrival: boolean;
  isSale: boolean;
  stockQuantity: number;
  description?: string;
  sizes?: { name: string; inStock: boolean }[];
  colors?: { name: string; hex: string; image?: string }[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  gender: string;
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  blue: "#0000FF",
  green: "#008000",
  yellow: "#FFFF00",
  pink: "#FFC0CB",
  grey: "#808080",
  gray: "#808080",
  navy: "#000080",
  orange: "#FFA500",
  brown: "#A52A2A",
  beige: "#F5F5DC",
  gold: "#FFD700",
  silver: "#C0C0C0",
  purple: "#800080",
  khaki: "#F0E68C",
  olive: "#808000",
  maroon: "#800000",
  charcoal: "#36454F",
  cream: "#FFFDD0",
  tan: "#D2B48C",
  mustard: "#FFDB58",
  burgundy: "#800020",
  lavender: "#E6E6FA",
  peach: "#FFDAB9",
  mint: "#98FF98",
  teal: "#008080",
  turquoise: "#40E0D0",
  coral: "#FF7F50",
  sand: "#C2B280",
};

function getColorHex(name: string): string {
  const cleanName = name.toLowerCase().trim();
  const hexMatch = cleanName.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
  if (hexMatch) return hexMatch[0];
  return COLOR_MAP[cleanName] || "#888888";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<"card" | "detail">("card");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    images: [] as string[],
    gender: "woman",
    sizes: "S, M, L, XL",
    colors: "Black, White",
    stockQuantity: "10",
    isTrending: false,
    isNewArrival: false,
    isSale: false,
  });

  const fetchProducts = async () => {
    try {
      const url = search ? `/api/v1/products?search=${encodeURIComponent(search)}&limit=100` : "/api/v1/products?limit=100";
      const res = await fetch(url);
      const json = await res.json();
      setProducts(json.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/categories?all=true&limit=100");
      const json = await res.json();
      setCategories(json.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    const images = form.images;
    const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, inStock: true }));
    const colors = form.colors.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, hex: getColorHex(name) }));

    const body = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || form.name,
      price: parseFloat(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
      images,
      gender: form.gender,
      categoryIds: selectedCategoryIds,
      sizes,
      colors,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      isTrending: form.isTrending,
      isNewArrival: form.isNewArrival,
      isSale: form.isSale,
      sku: editing?.slug ? `ZFR-${editing.slug.toUpperCase()}` : `ZFR-${Date.now()}`,
    };

    const res = await fetch(editing ? `/api/v1/products/${editing._id}` : "/api/v1/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/v1/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setSelectedCategoryIds(p.categoryIds || []);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      images: p.images || [],
      gender: p.gender,
      sizes: p.sizes?.map((s) => s.name).join(", ") || "S, M, L, XL",
      colors: p.colors?.map((c) => c.name).join(", ") || "Black, White",
      stockQuantity: String(p.stockQuantity || 0),
      isTrending: p.isTrending,
      isNewArrival: p.isNewArrival,
      isSale: p.isSale,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: "", slug: "", description: "", price: "", compareAtPrice: "",
      images: [], gender: "woman", sizes: "S, M, L, XL",
      colors: "Black, White", stockQuantity: "10", isTrending: false,
      isNewArrival: false, isSale: false,
    });
    setSelectedCategoryIds([]);
  };

  const startCreate = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const parentCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-8 w-64" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchProducts()} />
          </div>
          <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
            {/* Form Column */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Price *</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Compare Price</Label>
                  <Input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Stock</Label>
                  <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <select className="border rounded-md px-3 py-2 text-sm bg-background" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <ImageUploadManager
                  label="Product Images"
                  value={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                  multiple={true}
                />
              </div>

              {/* Category Checkboxes */}
              <div className="grid gap-2">
                <Label>Categories</Label>
                <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto bg-muted/20">
                  {parentCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  )}
                  {parentCategories.map((parent) => (
                    <div key={parent._id}>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(parent._id)}
                          onChange={() => toggleCategory(parent._id)}
                          className="rounded"
                        />
                        {parent.name}
                      </label>
                      <div className="ml-6 mt-1 space-y-1">
                        {getSubcategories(parent._id).map((sub) => (
                          <label key={sub._id} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(sub._id)}
                              onChange={() => toggleCategory(sub._id)}
                              className="rounded"
                            />
                            {sub.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Sizes (comma separated)</Label>
                  <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Colors (comma separated)</Label>
                  <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} />
                  Trending
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isSale} onChange={(e) => setForm({ ...form, isSale: e.target.checked })} />
                  On Sale
                </label>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>

            {/* Preview Column */}
            <div className="p-6 bg-muted/20 flex flex-col justify-between max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live Storefront Preview</h3>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-md border text-[10px]">
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded transition-colors ${previewMode === "card" ? "bg-white text-black font-semibold shadow-xs" : "text-muted-foreground hover:text-black"}`}
                      onClick={() => setPreviewMode("card")}
                    >
                      Grid Card
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded transition-colors ${previewMode === "detail" ? "bg-white text-black font-semibold shadow-xs" : "text-muted-foreground hover:text-black"}`}
                      onClick={() => setPreviewMode("detail")}
                    >
                      Details Page
                    </button>
                  </div>
                </div>

                {/* Simulated browser window */}
                <div className="border border-border rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300">
                  {/* Browser top-bar */}
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    </div>
                    <div className="flex-1 max-w-xs mx-auto bg-white border border-border rounded text-[9px] text-muted-foreground py-0.5 px-3 text-center truncate select-none">
                      {previewMode === "card"
                        ? `zfr-fashion.com/${form.gender || "woman"}`
                        : `zfr-fashion.com/product/${form.slug || "new-product"}`}
                    </div>
                  </div>
                  
                  {/* Browser content viewport */}
                  <div className="p-4 bg-white max-h-[50vh] overflow-y-auto">
                    {previewMode === "card" ? (
                      <div className="max-w-[200px] mx-auto bg-white border border-border p-3 shadow-xs rounded-xs">
                        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-2">
                          {form.images[0] ? (
                            <img
                              src={form.images[0]}
                              alt={form.name || "Product image"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
                          )}
                          {form.isSale && (
                            <span className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] tracking-wider px-1.5 py-0.5 font-semibold">
                              SALE
                            </span>
                          )}
                          {form.isNewArrival && !form.isSale && (
                            <span className="absolute top-1.5 left-1.5 bg-black text-white text-[8px] tracking-wider px-1.5 py-0.5 font-semibold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-left">
                          {form.colors && (
                            <div className="flex items-center gap-1 mb-1">
                              {form.colors.split(",").map((c) => c.trim()).filter(Boolean).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-2.5 h-2.5 rounded-full border border-border bg-gray-400"
                                  title={color}
                                />
                              ))}
                            </div>
                          )}
                          <h4 className="text-[11px] font-medium tracking-wide truncate">{form.name || "Product Name"}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold">{formatPrice(parseFloat(form.price) || 0)}</span>
                            {form.compareAtPrice && (
                              <span className="text-[9px] text-muted-foreground line-through">
                                {formatPrice(parseFloat(form.compareAtPrice) || 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white space-y-4 max-w-md mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Gallery */}
                          <div className="space-y-2">
                            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                              {form.images[0] ? (
                                <img
                                  src={form.images[0]}
                                  alt={form.name || "Product image"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
                              )}
                            </div>
                            {form.images.length > 1 && (
                              <div className="grid grid-cols-4 gap-1">
                                {form.images.slice(1, 5).map((img, i) => (
                                  <div key={i} className="relative aspect-square bg-muted overflow-hidden border">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-3 text-left">
                            <span className="text-[8px] tracking-[0.2em] font-medium uppercase opacity-75 block">{form.gender} section</span>
                            <h4 className="text-sm font-medium tracking-wide leading-tight">{form.name || "Product Name"}</h4>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold">{formatPrice(parseFloat(form.price) || 0)}</span>
                              {form.compareAtPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(parseFloat(form.compareAtPrice) || 0)}
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-muted-foreground border-t pt-2 max-h-16 overflow-y-auto leading-relaxed">
                              {form.description || "No description provided."}
                            </div>

                            {form.colors && (
                              <div className="space-y-1">
                                <span className="text-[8px] font-semibold tracking-wider uppercase text-muted-foreground block">Colors</span>
                                <div className="flex flex-wrap gap-1">
                                  {form.colors.split(",").map((c) => c.trim()).filter(Boolean).map((color, i) => (
                                    <span key={i} className="text-[9px] px-1.5 py-0.5 border rounded-sm bg-muted/40 font-mono capitalize">
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {form.sizes && (
                              <div className="space-y-1">
                                <span className="text-[8px] font-semibold tracking-wider uppercase text-muted-foreground block">Sizes</span>
                                <div className="flex flex-wrap gap-1">
                                  {form.sizes.split(",").map((s) => s.trim()).filter(Boolean).map((size, i) => (
                                    <span key={i} className="text-[8px] w-6 h-6 border flex items-center justify-center font-semibold">
                                      {size}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button type="button" className="w-full bg-black text-white text-[9px] py-2 tracking-wider font-semibold uppercase hover:bg-black/90 cursor-default">
                              ADD TO BASKET
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground text-center border-t pt-4 mt-4">
                This is a live preview simulation of how the product will appear on ZFR shop page layout.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{p.name}</TableCell>
                  <TableCell>{formatPrice(p.price)}{p.compareAtPrice ? <span className="text-muted-foreground line-through ml-2 text-xs">{formatPrice(p.compareAtPrice)}</span> : null}</TableCell>
                  <TableCell className="capitalize">{p.gender}</TableCell>
                  <TableCell>{p.stockQuantity}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
