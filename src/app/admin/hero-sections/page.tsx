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
import { Pencil, Trash2, Plus, ImageIcon } from "lucide-react";
import Image from "next/image";
import { ImageUploadManager } from "@/components/admin/ImageUploadManager";

interface HeroSection {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  leftImage?: string;
  rightImage?: string;
  ctaText: string;
  ctaLink: string;
  gender: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminHeroSectionsPage() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSection | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    leftImage: "",
    rightImage: "",
    ctaText: "VIEW NOW",
    ctaLink: "",
    gender: "woman",
    sortOrder: "",
    isActive: true,
  });

  const fetchHeroes = async () => {
    try {
      const res = await fetch("/api/v1/hero-sections?limit=100");
      const json = await res.json();
      setHeroes(json.data || []);
    } catch {
      setHeroes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const handleSubmit = async () => {
    const body = {
      ...form,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    const res = await fetch(editing ? `/api/v1/hero-sections/${editing._id}` : "/api/v1/hero-sections", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchHeroes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero section?")) return;
    const res = await fetch(`/api/v1/hero-sections/${id}`, { method: "DELETE" });
    if (res.ok) fetchHeroes();
  };

  const startEdit = (h: HeroSection) => {
    setEditing(h);
    setForm({
      title: h.title,
      subtitle: h.subtitle || "",
      image: h.image,
      leftImage: h.leftImage || "",
      rightImage: h.rightImage || "",
      ctaText: h.ctaText,
      ctaLink: h.ctaLink,
      gender: h.gender,
      sortOrder: String(h.sortOrder),
      isActive: h.isActive,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setForm({
      title: "", subtitle: "", image: "", leftImage: "", rightImage: "",
      ctaText: "VIEW NOW", ctaLink: "", gender: "woman", sortOrder: "", isActive: true,
    });
  };

  const startCreate = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const isDual = form.leftImage && form.rightImage && form.leftImage !== form.rightImage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hero Sections</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Add Hero</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>{editing ? "Edit Hero Section" : "Add Hero Section"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
            {/* Form Column */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid gap-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Subtitle</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
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
                <div className="grid gap-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="e.g. 1" />
                </div>
              </div>
              <div className="grid gap-2">
                <ImageUploadManager
                  label="Base Image * (fallback / single image)"
                  value={form.image}
                  onChange={(image) => setForm({ ...form, image })}
                  multiple={false}
                />
              </div>
              <div className="border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-medium mb-2 text-muted-foreground">For split-screen (two images side by side), fill both fields below:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <ImageUploadManager
                      label="Left Image (optional)"
                      value={form.leftImage}
                      onChange={(image) => setForm({ ...form, leftImage: image })}
                      multiple={false}
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUploadManager
                      label="Right Image (optional)"
                      value={form.rightImage}
                      onChange={(image) => setForm({ ...form, rightImage: image })}
                      multiple={false}
                    />
                  </div>
                </div>
                {isDual && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Will show as split-screen (dual images)
                  </p>
                )}
                {!isDual && form.leftImage && (
                  <p className="text-xs text-amber-600 mt-2">Will show as single full-width image (only left/base image used)</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CTA Text</Label>
                  <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>CTA Link</Label>
                  <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>

            {/* Preview Column */}
            <div className="p-6 bg-muted/20 flex flex-col justify-between max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live Hero Banner Preview</h3>
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
                      {`zfr-fashion.com (Homepage)`}
                    </div>
                  </div>
                  
                  {/* Browser content viewport */}
                  <div className="p-4 bg-white max-h-[50vh] overflow-y-auto">
                    <div className="relative aspect-[16/9] w-full bg-black text-white overflow-hidden border border-border rounded-lg shadow-sm max-w-lg mx-auto flex transition-all duration-300">
                      {isDual ? (
                        <>
                          {/* Left Image */}
                          <div className="relative w-1/2 h-full border-r border-black/25">
                            <img
                              src={form.leftImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Right Image */}
                          <div className="relative w-1/2 h-full">
                            <img
                              src={form.rightImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </>
                      ) : (
                        /* Single Image */
                        <div className="relative w-full h-full">
                          {form.image ? (
                            <img
                              src={form.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
                          )}
                        </div>
                      )}

                      {/* Text Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white bg-gradient-to-t from-black/55 via-black/10 to-transparent p-4 text-center">
                        <span className="text-[8px] tracking-[0.2em] font-medium uppercase opacity-75 mb-1">{form.gender} section</span>
                        <h2 className="text-sm font-semibold tracking-[0.1em] mb-1 leading-tight drop-shadow-md">
                          {form.title || "HERO TITLE"}
                        </h2>
                        {form.subtitle && (
                          <p className="text-[9px] font-light tracking-wider mb-3 opacity-90 drop-shadow">
                            {form.subtitle}
                          </p>
                        )}
                        <span className="inline-block bg-white text-black text-[9px] font-semibold tracking-[0.15em] px-4 py-1.5 rounded-sm shadow-sm select-none">
                          {form.ctaText || "VIEW NOW"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground text-center border-t pt-4 mt-4">
                This simulates the desktop ZFR storefront banner layout dynamically based on single or dual split images.
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
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {heroes.map((h) => {
                const hasDual = h.leftImage && h.rightImage && h.leftImage !== h.rightImage;
                return (
                  <TableRow key={h._id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <div className="relative w-10 h-14 rounded overflow-hidden bg-muted">
                          <Image src={h.leftImage || h.image} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                        {hasDual && (
                          <div className="relative w-10 h-14 rounded overflow-hidden bg-muted">
                            <Image src={h.rightImage!} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{h.title}</TableCell>
                    <TableCell className="capitalize">{h.gender}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${hasDual ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                        {hasDual ? "Dual" : "Single"}
                      </span>
                    </TableCell>
                    <TableCell>{h.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(h)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(h._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {heroes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No hero sections</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
