"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Trash2, Plus, Star, StarOff, Upload,
  Link as LinkIcon, ImageUp, Images, Search, Check, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Look {
  _id: string;
  image: string;
  userName?: string;
  caption?: string;
  instagramHandle?: string;
  isFeatured: boolean;
}

interface MediaItem {
  url: string;
  publicId: string;
  source: "cloudinary" | "local";
  name: string;
}

type ImageSource = "upload" | "url" | "media";

interface UploadQueueItem {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
}

export default function LooksAdminPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [imageSource, setImageSource] = useState<ImageSource>("upload");

  // Upload tab — multi-file queue
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media Library tab — multi-select
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  // URL tab
  const [urlInput, setUrlInput] = useState("");

  // Shared optional metadata (applied to all added looks)
  const [form, setForm] = useState({
    userName: "",
    caption: "",
    instagramHandle: "",
    isFeatured: false,
  });

  // ─── Fetch looks ─────────────────────────────────────────────────────────────
  const fetchLooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/looks?limit=100");
      const json = await res.json();
      setLooks(json.data || []);
    } catch {
      toast.error("Failed to load looks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLooks(); }, [fetchLooks]);

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

  // ─── Add files to upload queue ────────────────────────────────────────────────
  function addFilesToQueue(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) { toast.error("Only image files are supported"); return; }
    const newItems: UploadQueueItem[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFilesToQueue(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFilesToQueue(e.dataTransfer.files);
  }

  function removeFromQueue(index: number) {
    setUploadQueue((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  // ─── Upload all pending files → create looks ──────────────────────────────────
  async function uploadAndCreate() {
    const pending = uploadQueue.filter((i) => i.status === "pending");
    if (pending.length === 0) { toast.error("No images to upload"); return; }
    setSubmitting(true);

    const updatedQueue = [...uploadQueue];
    let successCount = 0;

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status !== "pending") continue;

      updatedQueue[i] = { ...item, status: "uploading" };
      setUploadQueue([...updatedQueue]);

      try {
        // 1. Upload file
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("folder", "zfr-looks");
        const uploadRes = await fetch("/api/v1/upload", { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error?.message || "Upload failed");

        const imageUrl = uploadJson.data.url;

        // 2. Create look
        await fetch("/api/v1/looks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageUrl, ...form }),
        });

        updatedQueue[i] = { ...updatedQueue[i], status: "done", url: imageUrl };
        successCount++;
      } catch {
        updatedQueue[i] = { ...updatedQueue[i], status: "error" };
      }
      setUploadQueue([...updatedQueue]);
    }

    setSubmitting(false);
    if (successCount > 0) {
      toast.success(`${successCount} look${successCount > 1 ? "s" : ""} added!`);
      // Clear done items
      setUploadQueue((prev) => prev.filter((i) => i.status !== "done"));
      fetchLooks();
    }
  }

  // ─── Add selected media as looks ─────────────────────────────────────────────
  async function addSelectedMediaAsLooks() {
    if (selectedMedia.size === 0) { toast.error("Select at least one image"); return; }
    setSubmitting(true);
    let successCount = 0;

    for (const publicId of selectedMedia) {
      const item = mediaItems.find((m) => m.publicId === publicId);
      if (!item) continue;
      try {
        await fetch("/api/v1/looks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: item.url, ...form }),
        });
        successCount++;
      } catch {
        toast.error(`Failed to add ${item.name}`);
      }
    }

    setSubmitting(false);
    if (successCount > 0) {
      toast.success(`${successCount} look${successCount > 1 ? "s" : ""} added!`);
      setSelectedMedia(new Set());
      fetchLooks();
    }
  }

  // ─── Add URL as look ─────────────────────────────────────────────────────────
  async function addUrlAsLook() {
    const url = urlInput.trim();
    if (!url) { toast.error("Enter an image URL"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url, ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Look added!");
      setUrlInput("");
      fetchLooks();
    } catch {
      toast.error("Failed to add look");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Submit dispatcher ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageSource === "upload") await uploadAndCreate();
    else if (imageSource === "media") await addSelectedMediaAsLooks();
    else await addUrlAsLook();
  }

  function resetForm() {
    setShowForm(false);
    uploadQueue.forEach((i) => URL.revokeObjectURL(i.preview));
    setUploadQueue([]);
    setSelectedMedia(new Set());
    setUrlInput("");
    setForm({ userName: "", caption: "", instagramHandle: "", isFeatured: false });
  }

  // ─── Toggle media selection ──────────────────────────────────────────────────
  function toggleMediaSelect(publicId: string) {
    setSelectedMedia((prev) => {
      const next = new Set(prev);
      if (next.has(publicId)) next.delete(publicId); else next.add(publicId);
      return next;
    });
  }

  // ─── Looks grid actions ──────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this look?")) return;
    try {
      await fetch(`/api/v1/looks/${id}`, { method: "DELETE" });
      toast.success("Look deleted");
      setLooks((prev) => prev.filter((l) => l._id !== id));
    } catch { toast.error("Failed to delete look"); }
  }

  async function toggleFeatured(look: Look) {
    try {
      await fetch(`/api/v1/looks/${look._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !look.isFeatured }),
      });
      toast.success(look.isFeatured ? "Removed from featured" : "Marked as featured");
      setLooks((prev) => prev.map((l) => l._id === look._id ? { ...l, isFeatured: !l.isFeatured } : l));
    } catch { toast.error("Failed to update look"); }
  }

  const filteredMedia = mediaItems.filter((m) =>
    m.name.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  const tabs: { id: ImageSource; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "Upload from Device", icon: <ImageUp className="w-3.5 h-3.5" /> },
    { id: "media",  label: "Media Library",      icon: <Images className="w-3.5 h-3.5" /> },
    { id: "url",    label: "Paste URL",           icon: <LinkIcon className="w-3.5 h-3.5" /> },
  ];

  // Count how many images are ready to add
  const readyCount =
    imageSource === "upload" ? uploadQueue.filter((i) => i.status === "pending").length :
    imageSource === "media"  ? selectedMedia.size :
    urlInput.trim() ? 1 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">#INZFR Looks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage community looks shown in the #INZFR section on the homepage.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-black text-white text-xs font-medium tracking-wider px-4 py-2.5 hover:bg-black/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Looks
        </button>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-border bg-white space-y-5">
          <h2 className="text-sm font-semibold tracking-wide">Add Looks</h2>

          {/* Tabs */}
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

          {/* ── Upload tab ────────────────────────────────────────────────────── */}
          {imageSource === "upload" && (
            <div className="space-y-3">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded cursor-pointer transition-colors flex flex-col items-center justify-center py-8 px-4 text-center ${
                  dragOver ? "border-black bg-black/5" : "border-border hover:border-black/40 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop images here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Select multiple images at once • JPG, PNG, WEBP</p>
              </div>

              {/* Queue preview grid */}
              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{uploadQueue.length} image{uploadQueue.length > 1 ? "s" : ""} selected</span>
                    <button
                      type="button"
                      onClick={() => { uploadQueue.forEach((i) => URL.revokeObjectURL(i.preview)); setUploadQueue([]); }}
                      className="hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {uploadQueue.map((item, idx) => (
                      <div key={idx} className="relative aspect-square bg-muted overflow-hidden rounded border border-border group">
                        <Image src={item.preview} alt="" fill className="object-cover" sizes="80px" />
                        {/* Status overlay */}
                        {item.status === "uploading" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        {item.status === "done" && (
                          <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {/* Remove button (only for pending) */}
                        {item.status === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFromQueue(idx); }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Media Library tab ─────────────────────────────────────────────── */}
          {imageSource === "media" && (
            <div className="space-y-3">
              {/* Search + controls */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search images…"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {mediaSearch && (
                    <button type="button" onClick={() => setMediaSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-black" />
                    </button>
                  )}
                </div>
                {selectedMedia.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMedia(new Set())}
                    className="text-xs text-muted-foreground hover:text-red-600 transition-colors whitespace-nowrap"
                  >
                    Clear ({selectedMedia.size})
                  </button>
                )}
                {filteredMedia.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = new Set(filteredMedia.map((m) => m.publicId));
                      setSelectedMedia(allIds);
                    }}
                    className="text-xs text-muted-foreground hover:text-black transition-colors whitespace-nowrap"
                  >
                    Select all
                  </button>
                )}
              </div>

              {/* Selection count */}
              {selectedMedia.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-black text-white text-xs rounded">
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedMedia.size} image{selectedMedia.size > 1 ? "s" : ""} selected</span>
                </div>
              )}

              {/* Grid */}
              {mediaLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Images className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    {mediaSearch ? "No images match your search" : "No media found"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload images in the{" "}
                    <a href="/admin/media" className="underline text-black">Media</a> page first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                  {filteredMedia.map((item) => {
                    const isSelected = selectedMedia.has(item.publicId);
                    return (
                      <button
                        key={item.publicId}
                        type="button"
                        onClick={() => toggleMediaSelect(item.publicId)}
                        className={`relative aspect-square overflow-hidden border-2 rounded transition-all ${
                          isSelected ? "border-black ring-2 ring-black ring-offset-1" : "border-transparent hover:border-black/40"
                        }`}
                      >
                        <Image src={item.url} alt={item.name} fill className="object-cover" sizes="120px" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {item.source === "local" && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5">
                            LOCAL
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{filteredMedia.length} image{filteredMedia.length !== 1 ? "s" : ""} in library</span>
                <button type="button" onClick={fetchMedia} className="underline hover:text-black transition-colors">
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* ── URL tab ───────────────────────────────────────────────────────── */}
          {imageSource === "url" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              {urlInput && (
                <div className="relative w-24 h-32 overflow-hidden border border-border mt-2">
                  <Image src={urlInput} alt="Preview" fill className="object-cover" sizes="96px" />
                </div>
              )}
            </div>
          )}

          {/* Optional metadata */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Optional — applied to all added looks
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah M."
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Instagram Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={form.instagramHandle}
                  onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Caption</label>
                <input
                  type="text"
                  placeholder="Optional caption"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isFeatured" className="text-sm">Mark all as Featured</label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || readyCount === 0}
              className="bg-black text-white text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</span>
              ) : (
                readyCount > 0
                  ? `Add ${readyCount} Look${readyCount > 1 ? "s" : ""}`
                  : "Add Look"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-border text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Looks Grid ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      ) : looks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border">
          <Upload className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">No looks yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Add images to populate the #INZFR community section on the homepage.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-black/80 transition-colors"
          >
            Add First Look
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {looks.map((look) => (
            <div key={look._id} className="group relative aspect-[3/4] bg-muted overflow-hidden">
              <Image
                src={look.image}
                alt={look.userName || "Look"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => toggleFeatured(look)}
                  title={look.isFeatured ? "Remove from featured" : "Mark as featured"}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white"
                >
                  {look.isFeatured
                    ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    : <StarOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(look._id)}
                  title="Delete look"
                  className="p-2 bg-white/20 hover:bg-red-500/80 rounded-full transition-colors text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {look.isFeatured && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 text-black">
                  FEATURED
                </div>
              )}
              {look.userName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-[10px] font-medium truncate">{look.userName}</p>
                  {look.instagramHandle && (
                    <p className="text-white/70 text-[9px] truncate">{look.instagramHandle}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
