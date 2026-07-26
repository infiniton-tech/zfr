"use client";

import { useState } from "react";
import { ShieldAlert, Trash2, Database, Loader2, X, CheckCircle2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearCloudinaryOpt, setClearCloudinaryOpt] = useState(true);
  const [clearLocalOpt, setClearLocalOpt] = useState(true);
  const [clearDatabaseOpt, setClearDatabaseOpt] = useState(true);
  const [confirmInput, setConfirmInput] = useState("");
  const [clearing, setClearing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

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
        toast.success("Full database media cleared successfully!");
        setLastResult(json.data);
        setShowClearModal(false);
        setConfirmInput("");
      } else {
        toast.error(json.error?.message || "Failed to clear media");
      }
    } catch {
      toast.error("An error occurred while clearing media");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-foreground" />
          Admin Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure store parameters, media storage, and database management.</p>
      </div>

      {/* Media Management & Cleanup Section */}
      <div className="border border-border rounded-xl bg-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-red-600" />
            Database & Media Storage Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage media files stored in Cloudinary and server local storage, and reset media records across MongoDB collections.
          </p>
        </div>

        {lastResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-xs text-green-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-green-950">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Recent Cleanup Summary
            </div>
            <p>• Cloudinary Status: <span className="font-mono">{lastResult.cloudinaryStatus}</span></p>
            <p>• Local Files Unlinked: <span className="font-mono">{lastResult.localFilesDeletedCount}</span></p>
            <p>• Products Reset: <span className="font-mono">{lastResult.dbStats?.products || 0}</span></p>
            <p>• Categories Reset: <span className="font-mono">{lastResult.dbStats?.categories || 0}</span></p>
          </div>
        )}

        <div className="bg-red-50/50 border border-red-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-red-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              Clear Full Database Media
            </h3>
            <p className="text-xs text-red-700 max-w-xl">
              Permanently delete all media uploads from Cloudinary and local storage, and clear image links across all products, categories, hero sections, looks, trending items, and user profiles.
            </p>
          </div>

          <button
            onClick={() => setShowClearModal(true)}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Full Media
          </button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border">
          <span>Need to manage individual media items?</span>
          <Link href="/admin/media" className="text-primary hover:underline font-medium">
            Open Media Library →
          </Link>
        </div>
      </div>

      {/* Modal */}
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
