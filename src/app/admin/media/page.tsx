"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Copy, Check, X, Loader2, AlertTriangle, RefreshCw, Trash2, Database, ShieldAlert, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MediaItem {
  url: string;
  publicId: string;
  source: "cloudinary" | "local";
  name: string;
  createdAt?: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // All media from library
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState(true);

  // Clear Database Media state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearCloudinaryOpt, setClearCloudinaryOpt] = useState(true);
  const [clearLocalOpt, setClearLocalOpt] = useState(true);
  const [clearDatabaseOpt, setClearDatabaseOpt] = useState(true);
  const [confirmInput, setConfirmInput] = useState("");
  const [clearing, setClearing] = useState(false);

  // ─── Load all media from API ─────────────────────────────────────────────────
  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/v1/media");
      const json = await res.json();
      const items: MediaItem[] = json.data || [];
      setMediaItems(items);
      if (items.length === 0 || items.every((i) => i.source === "local")) {
        setCloudinaryConfigured(false);
      } else {
        setCloudinaryConfigured(true);
      }
    } catch {
      toast.error("Failed to load media library");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  // ─── File picker ─────────────────────────────────────────────────────────────
  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (valid.length === 0) return;
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.data?.url) {
          successCount++;
          if (json.data.source === "local" || json.warning) {
            toast.warning(`"${file.name}" saved locally — won't persist on serverless hosts`);
          }
        } else {
          toast.error(json.error?.message || `Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? "s" : ""} uploaded`);
      setFiles([]);
      fetchMedia();
    }
  };

  // ─── Copy URL ────────────────────────────────────────────────────────────────
  const copyUrl = (url: string, publicId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("URL copied!");
  };

  // ─── Delete Single Media ──────────────────────────────────────────────────────
  const handleDelete = async (publicId: string, source: "cloudinary" | "local") => {
    if (!confirm("Are you sure you want to delete this image permanently?")) return;

    setDeletingId(publicId);
    try {
      const res = await fetch("/api/v1/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, source }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Image deleted successfully");
        fetchMedia();
      } else {
        toast.error(json.error?.message || "Failed to delete image");
      }
    } catch {
      toast.error("An error occurred while deleting the image");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Clear All Database Media ─────────────────────────────────────────────────
  const handleClearAllMedia = async () => {
    if (confirmInput.trim().toUpperCase() !== "CLEAR MEDIA") {
      toast.error('Please type "CLEAR MEDIA" to confirm.');
      return;
    }

    setClearing(true);
    try {
      const res = await fetch("/api/v1/media/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clearCloudinary: clearCloudinaryOpt,
          clearLocal: clearLocalOpt,
          clearDatabase: clearDatabaseOpt,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.success) {
        toast.success("Database media cleared successfully!");
        setShowClearModal(false);
        setConfirmInput("");
        fetchMedia();
      } else {
        toast.error(json.error?.message || "Failed to clear media");
      }
    } catch {
      toast.error("An error occurred while clearing media");
    } finally {
      setClearing(false);
    }
  };

  // ─── Drag handlers ───────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage, upload, and clean up product and store images.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3.5 py-2 rounded-md transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Clear Database Media
          </button>

          <button
            onClick={fetchMedia}
            disabled={mediaLoading}
            className="flex items-center gap-2 text-xs border border-border px-3.5 py-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${mediaLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Cloudinary info / warning */}
      {!mediaLoading && !cloudinaryConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Cloudinary not configured</h3>
              <p className="text-sm mt-1 leading-relaxed">
                Images are being saved locally and will not persist after restarts or redeploys.
                Set <code className="bg-white/60 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-white/60 px-1 rounded">CLOUDINARY_API_KEY</code>, <code className="bg-white/60 px-1 rounded">CLOUDINARY_API_SECRET</code> in your <code className="bg-white/60 px-1 rounded">.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone Card for Clearing Full Database Media ─────────────────── */}
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-950">Clear Database Media & Storage</h3>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                Wipe all uploaded images from Cloudinary, local server uploads, and reset image references across Products, Categories, Hero Sections, Looks, Trending items, and Users in MongoDB.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowClearModal(true)}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Full Media
          </button>
        </div>
      </div>

      {/* ── Upload Area ─────────────────────────────────────────────────────── */}
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-sm font-semibold tracking-wide">Upload New Images</h2>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center ${
            dragActive ? "border-black bg-muted/40" : "border-border hover:border-black hover:bg-muted/10"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          <Upload className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold">Drag & drop or click to select</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF up to 10MB</p>
        </div>

        {files.length > 0 && (
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{files.length} file{files.length > 1 ? "s" : ""} ready to upload</p>
              <button onClick={() => setFiles([])} className="text-xs text-muted-foreground hover:text-red-600 transition-colors">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded text-xs">
                  <span className="truncate max-w-[180px]">{file.name}</span>
                  <button onClick={() => removeFile(idx)} disabled={uploading}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex items-center gap-2 bg-black text-white text-xs font-medium tracking-wider px-6 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? files.length : ""} {files.length === 1 ? "file" : "files"}</>
          )}
        </button>
      </div>

      {/* ── All Uploaded Images ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-wide">
            All Uploaded Images
          </h2>
          {!mediaLoading && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {mediaItems.length}
            </span>
          )}
        </div>

        {mediaLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
            <Upload className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No images yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first image above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {mediaItems.map((item) => (
              <div key={item.publicId} className="group relative aspect-square bg-muted overflow-hidden rounded border border-border">
                {/* Image */}
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
                />

                {/* Source badge */}
                {item.source === "local" && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-[9px] font-bold px-1 py-0.5 text-black rounded">
                    LOCAL
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex gap-1.5 justify-end w-full">
                    <button
                      onClick={() => copyUrl(item.url, item.publicId)}
                      title="Copy URL"
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded transition-colors text-white cursor-pointer"
                    >
                      {copiedId === item.publicId ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.publicId, item.source)}
                      disabled={deletingId === item.publicId}
                      title="Delete Image"
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded transition-colors text-white disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === item.publicId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-white text-[10px] w-full truncate leading-tight">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Clear All Media Modal ─────────────────────────────────────────────── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <ShieldAlert className="w-5 h-5" />
                Clear Full Database Media
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will permanently delete media assets and clean image links. Select the targets to wipe below:
            </p>

            <div className="space-y-2.5 bg-muted/30 p-3.5 rounded-lg border border-border text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={clearCloudinaryOpt}
                  onChange={(e) => setClearCloudinaryOpt(e.target.checked)}
                  className="rounded accent-red-600"
                />
                Wipe Cloudinary Cloud Storage
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={clearLocalOpt}
                  onChange={(e) => setClearLocalOpt(e.target.checked)}
                  className="rounded accent-red-600"
                />
                Wipe Local Server Uploads (/public/uploads)
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={clearDatabaseOpt}
                  onChange={(e) => setClearDatabaseOpt(e.target.checked)}
                  className="rounded accent-red-600"
                />
                Reset MongoDB Image References (Products, Categories, Hero, Looks, Trending, Users)
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Type <span className="font-mono text-red-600">CLEAR MEDIA</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="CLEAR MEDIA"
                className="w-full text-xs px-3 py-2 border border-border rounded focus:outline-none focus:border-red-600 font-mono"
                disabled={clearing}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="px-4 py-2 text-xs font-medium border border-border rounded hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllMedia}
                disabled={confirmInput.trim().toUpperCase() !== "CLEAR MEDIA" || clearing}
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {clearing ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Clearing Media…</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Wipe Selected Media</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
