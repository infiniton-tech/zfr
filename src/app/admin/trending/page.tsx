"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Eye, EyeOff, GripVertical,
  ImageUp, Images, Link as LinkIcon, Search, Check, X, Loader2, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { LinkSelector } from "@/components/admin/LinkSelector";

interface TrendingItem {
  _id: string;
  name: string;
  image: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
}

interface MediaItem {
  url: string;
  publicId: string;
  source: "cloudinary" | "local";
  name: string;
}

type ImageSource = "upload" | "media" | "url";

const EMPTY_FORM = { name: "", image: "", ctaLink: "", sortOrder: 0, isActive: true };

export default function TrendingAdminPage() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<TrendingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Image source
  const [imageSource, setImageSource] = useState<ImageSource>("upload");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media library
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Layout position settings
  const [sectionPosition, setSectionPosition] = useState<string>("below-products");
  const [savingPosition, setSavingPosition] = useState<boolean>(false);

  useEffect(() => {
    async function loadPosition() {
      try {
        const res = await fetch("/api/v1/store-settings?key=trending_section_position");
        const json = await res.json();
        if (json.data?.value) {
          // Legacy value "between-heroes" renders the same as "below-heroes"
          setSectionPosition(json.data.value === "between-heroes" ? "below-heroes" : json.data.value);
        }
      } catch {
        console.error("Failed to load trending section position");
      }
    }
    loadPosition();
  }, []);

  const handleSavePosition = async (pos: string) => {
    setSectionPosition(pos);
    setSavingPosition(true);
    try {
      const res = await fetch("/api/v1/store-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "trending_section_position", value: pos }),
      });
      if (res.ok) {
        toast.success("Trending section position updated successfully");
      } else {
        toast.error("Failed to save trending position setting");
      }
    } catch {
      toast.error("An error occurred while saving position");
    } finally {
      setSavingPosition(false);
    }
  };

  // ─── Fetch items ──────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Admin view: fetch all (including inactive) directly
      const res = await fetch("/api/v1/trending");
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      toast.error("Failed to load trending items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ─── Fetch media library ──────────────────────────────────────────────────────
  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/v1/media");
      const json = await res.json();
      setMediaItems(json.data || []);
    } catch {
      toast.error("Failed to load media library");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (imageSource === "media" && mediaItems.length === 0) fetchMedia();
  }, [imageSource, mediaItems.length, fetchMedia]);

  // ─── Upload file ──────────────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Images only"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "zfr-trending");
      const res = await fetch("/api/v1/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Upload failed");
      setUploadedUrl(json.data.url);
      setForm((f) => ({ ...f, image: json.data.url }));
      toast.success("Image uploaded!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ─── Get final image URL ──────────────────────────────────────────────────────
  const resolvedImage =
    imageSource === "upload" ? uploadedUrl :
    imageSource === "media"  ? (selectedMedia?.url ?? "") :
    form.image;

  // ─── Open edit ────────────────────────────────────────────────────────────────
  function openEdit(item: TrendingItem) {
    setEditItem(item);
    setForm({ name: item.name, image: item.image, ctaLink: item.ctaLink, sortOrder: item.sortOrder, isActive: item.isActive });
    setImageSource("url");
    setShowForm(true);
  }

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setUploadedUrl("");
    setSelectedMedia(null);
    setImageSource("upload");
    setShowForm(true);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const image = editItem ? form.image : resolvedImage;
    if (!image) { toast.error("Please add an image"); return; }
    if (!form.name.trim()) { toast.error("Label is required"); return; }
    if (!form.ctaLink.trim()) { toast.error("Link is required"); return; }

    setSubmitting(true);
    try {
      const payload = { ...form, image };

      if (editItem) {
        const res = await fetch(`/api/v1/trending/${editItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Updated!");
      } else {
        const res = await fetch("/api/v1/trending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Added to Trending!");
      }

      resetForm();
      fetchItems();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
    setUploadedUrl("");
    setSelectedMedia(null);
    setMediaSearch("");
  }

  // ─── Toggle active ────────────────────────────────────────────────────────────
  async function toggleActive(item: TrendingItem) {
    try {
      await fetch(`/api/v1/trending/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
      toast.success(item.isActive ? "Hidden from homepage" : "Shown on homepage");
    } catch { toast.error("Failed to update"); }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this trending item?")) return;
    try {
      await fetch(`/api/v1/trending/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch { toast.error("Failed to delete"); }
  }

  const filteredMedia = mediaItems.filter((m) => m.name.toLowerCase().includes(mediaSearch.toLowerCase()));

  const tabs: { id: ImageSource; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "Upload",        icon: <ImageUp className="w-3.5 h-3.5" /> },
    { id: "media",  label: "Media Library", icon: <Images className="w-3.5 h-3.5" /> },
    { id: "url",    label: "Paste URL",     icon: <LinkIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Trending Now</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the 4-card "TRENDING NOW" section on the homepage.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-black text-white text-xs font-medium tracking-wider px-4 py-2.5 hover:bg-black/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Position setting panel */}
      <div className="mb-6 p-4 bg-neutral-50 border border-border rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
            Section Placement on Storefront
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select where the "Trending Now" section should render on the homepage. Default layout: Hero banner → Product slider → Trending → Community.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "above-heroes", label: "Above Hero Banner" },
            { id: "below-heroes", label: "Between Hero & Products" },
            { id: "below-products", label: "Below Product Slider (Default)" },
          ].map((pos) => {
            const isSelected = sectionPosition === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => handleSavePosition(pos.id)}
                disabled={savingPosition}
                className={`px-4 py-2 text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-muted-foreground hover:text-foreground border-border hover:bg-neutral-50"
                }`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border bg-white space-y-5">
          <h2 className="text-sm font-semibold tracking-wide">
            {editItem ? "Edit Trending Item" : "New Trending Item"}
          </h2>

          {/* Image section — tabs only shown for new items */}
          {!editItem && (
            <>
              <div className="flex border border-border rounded overflow-hidden w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setImageSource(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
                      imageSource === tab.id ? "bg-black text-white" : "bg-white text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Upload */}
              {imageSource === "upload" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded cursor-pointer transition-colors flex flex-col items-center justify-center py-8 text-center ${
                    dragOver ? "border-black bg-black/5" : "border-border hover:border-black/40 hover:bg-muted/30"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Uploading…</p>
                    </div>
                  ) : uploadedUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-24 h-32 overflow-hidden border border-border">
                        <Image src={uploadedUrl} alt="Uploaded" fill className="object-cover" sizes="96px" />
                      </div>
                      <p className="text-xs text-green-600 font-medium">✓ Uploaded</p>
                      <p className="text-[11px] text-muted-foreground">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <ImageUp className="w-7 h-7 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Drop image or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              )}

              {/* Media Library */}
              {imageSource === "media" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text" placeholder="Search images…" value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  {selectedMedia && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      <div className="relative w-10 h-12 shrink-0 overflow-hidden border border-green-200">
                        <Image src={selectedMedia.url} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                      <span className="flex-1 truncate font-medium">{selectedMedia.name}</span>
                      <button type="button" onClick={() => setSelectedMedia(null)}><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  {mediaLoading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                      {filteredMedia.map((item) => {
                        const isSel = selectedMedia?.publicId === item.publicId;
                        return (
                          <button
                            key={item.publicId}
                            type="button"
                            onClick={() => setSelectedMedia(isSel ? null : item)}
                            className={`relative aspect-square overflow-hidden border-2 rounded transition-all ${
                              isSel ? "border-black ring-2 ring-black ring-offset-1" : "border-transparent hover:border-black/40"
                            }`}
                          >
                            <Image src={item.url} alt={item.name} fill className="object-cover" sizes="100px" />
                            {isSel && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* URL */}
              {imageSource === "url" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                  <input
                    type="url" placeholder="https://…" value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {form.image && (
                    <div className="relative w-24 h-32 overflow-hidden border border-border">
                      <Image src={form.image} alt="Preview" fill className="object-cover" sizes="96px" />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Edit mode: show current image + URL field */}
          {editItem && (
            <div className="flex gap-4 items-start">
              <div className="relative w-24 h-32 shrink-0 overflow-hidden border border-border bg-muted">
                <Image src={form.image || editItem.image} alt="" fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                <input
                  type="url" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Label <span className="text-red-500">*</span></label>
              <input
                type="text" placeholder="e.g. TOPS, TROUSERS, DRESSES"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Link <span className="text-red-500">*</span></label>
              <LinkSelector
                value={form.ctaLink}
                onChange={(val) => setForm({ ...form, ctaLink: val })}
                placeholder="e.g. /woman/tops or /man/shirts"
                suggestLabel={form.name}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Sort Order</label>
              <input
                type="number" min={0} value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-24 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <p className="text-[11px] text-muted-foreground">Lower = appears first</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm">Show on homepage</label>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-black text-white text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {submitting
                ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</span>
                : editItem ? "Save Changes" : "Add Item"
              }
            </button>
            <button
              type="button" onClick={resetForm}
              className="border border-border text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Items Grid ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded">
          <GripVertical className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">No trending items yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Add items to show in the "TRENDING NOW" section on the homepage.
          </p>
          <button
            onClick={openAdd}
            className="bg-black text-white text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-black/80 transition-colors"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {items.filter((i) => i.isActive).length} active · {items.length} total · Homepage shows up to 4 active items
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className={`group relative rounded border overflow-hidden bg-muted transition-opacity ${!item.isActive ? "opacity-50" : ""}`}>
                {/* Image */}
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>

                {/* Name bar */}
                <div className="px-3 py-2 bg-white border-t border-border">
                  <p className="text-xs font-semibold tracking-wider">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.ctaLink}</p>
                </div>

                {/* Sort order badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  #{item.sortOrder}
                </div>

                {/* Inactive badge */}
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-[10px] font-bold px-1.5 py-0.5 text-black rounded">
                    HIDDEN
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(item)}
                    title="Edit"
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    title={item.isActive ? "Hide" : "Show"}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white"
                  >
                    {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Delete"
                    className="p-2 bg-white/20 hover:bg-red-500/80 rounded-full transition-colors text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
