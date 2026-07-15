"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, Link2, ImageIcon, FolderOpen } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocalImage {
  name: string;
  url: string;
}

interface ImageUploadManagerProps {
  value: string | string[];
  // Polymorphic handler: string for single mode, string[] for multiple mode.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  multiple?: boolean;
  folder?: string;
  label?: string;
}

export function ImageUploadManager({
  value,
  onChange,
  multiple = false,
  folder = "zfr-products",
  label,
}: ImageUploadManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localDialogOpen, setLocalDialogOpen] = useState(false);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [localDragActive, setLocalDragActive] = useState(false);

  // Normalize value to string array for easier internal processing
  const getImagesArray = (): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
  };

  const images = getImagesArray();

  const fetchLocalImages = useCallback(async () => {
    setLoadingLocal(true);
    try {
      const res = await fetch("/api/v1/local-images");
      const json = await res.json();
      setLocalImages(json.data || []);
    } catch (error) {
      console.error("Failed to load local images:", error);
      toast.error("Failed to load local images");
      setLocalImages([]);
    } finally {
      setLoadingLocal(false);
    }
  }, []);

  const openLocalDialog = () => {
    setLocalDialogOpen(true);
    fetchLocalImages();
  };

  const handleLocalUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setUploadingLocal(true);
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];
      let localFallbackCount = 0;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "zfr-heroes");

        try {
          const res = await fetch("/api/v1/upload", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (json.data?.url) {
            uploadedUrls.push(json.data.url);
            if (json.data.source === "local" || json.warning) {
              localFallbackCount++;
            }
          } else {
            failedFiles.push(file.name);
            toast.error(json.error?.message || `Failed to upload ${file.name}`);
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          failedFiles.push(file.name);
          toast.error(`An error occurred while uploading ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          const newImages = [...images, ...uploadedUrls];
          onChange(newImages);
        } else {
          onChange(uploadedUrls[uploadedUrls.length - 1]);
        }

        const cloudinaryCount = uploadedUrls.length - localFallbackCount;
        if (cloudinaryCount > 0) {
          toast.success(
            `${cloudinaryCount} image${cloudinaryCount === 1 ? "" : "s"} uploaded to Cloudinary`
          );
        }
        if (localFallbackCount > 0) {
          toast.warning(
            `${localFallbackCount} image${localFallbackCount === 1 ? "" : "s"} saved locally only — will not persist on Vercel`
          );
        }
      }

      setUploadingLocal(false);
      setLocalDragActive(false);
    },
    [images, multiple, onChange]
  );

  const handleLocalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLocalDragActive(false);
      handleLocalUpload(e.dataTransfer.files);
    },
    [handleLocalUpload]
  );

  const handleLocalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalDragActive(true);
  }, []);

  const handleLocalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalDragActive(false);
  }, []);

  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
          const res = await fetch("/api/v1/upload", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (json.data?.url) {
            uploadedUrls.push(json.data.url);
          } else {
            toast.error(json.error?.message || `Failed to upload ${file.name}`);
          }
        } catch (error) {
          console.error("Failed to upload file:", error);
          toast.error(`An error occurred while uploading ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        if (multiple) {
          const newImages = [...images, ...uploadedUrls];
          onChange(newImages);
        } else {
          // Take the last successfully uploaded image
          onChange(uploadedUrls[uploadedUrls.length - 1]);
        }
      }
      setUploading(false);
    },
    [folder, multiple, images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    if (multiple) {
      onChange(newImages);
    } else {
      onChange("");
    }
  };

  const handleAddManualUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    if (multiple) {
      onChange([...images, url]);
    } else {
      onChange(url);
    }
    setUrlInput("");
    setShowUrlInput(false);
  };

  const handleSelectLocalImage = (url: string) => {
    if (multiple) {
      if (!images.includes(url)) {
        onChange([...images, url]);
      }
    } else {
      onChange(url);
      setLocalDialogOpen(false);
    }
  };

  const isSelected = (url: string) => images.includes(url);

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium tracking-tight">{label}</label>}

      {/* Preview Section */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group bg-muted/30 transition-transform duration-200 hover:scale-105"
            >
              <Image
                src={url}
                alt="Upload preview"
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && multiple && (
                <span className="absolute bottom-0 inset-x-0 text-[10px] bg-black/65 text-white text-center py-0.5 tracking-wider font-semibold">
                  COVER
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Box / Action Row */}
      <div className="flex gap-2">
        {(!multiple && images.length > 0) ? null : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex-1 border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center relative ${
              dragActive ? "border-black bg-muted/40" : "border-muted-foreground/30 hover:border-black hover:bg-muted/10"
            }`}
          >
            <input
              type="file"
              multiple={multiple}
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground/80">Drag & drop or Click</p>
                <p className="text-[10px] text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openLocalDialog}
            className="text-xs h-10 px-3 flex items-center gap-1"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Local Images
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs h-10 px-3 flex items-center gap-1"
          >
            <Link2 className="w-3.5 h-3.5" />
            {showUrlInput ? "Hide URL" : "Paste Link"}
          </Button>
        </div>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 items-center bg-muted/10 p-2 border rounded-lg">
          <Input
            placeholder="https://images.unsplash.com/photo-..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="text-xs flex-1 h-9"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddManualUrl}
            className="text-xs h-9 bg-black text-white hover:bg-black/90"
          >
            Add
          </Button>
        </div>
      )}

      {/* Local Images Dialog */}
      <Dialog open={localDialogOpen} onOpenChange={setLocalDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Select Local Image{multiple ? "s" : ""}
            </DialogTitle>
          </DialogHeader>

          {/* Upload new images to public/images */}
          <div
            onDrop={handleLocalDrop}
            onDragOver={handleLocalDragOver}
            onDragLeave={handleLocalDragLeave}
            className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center relative ${
              localDragActive ? "border-black bg-muted/40" : "border-muted-foreground/30 hover:border-black hover:bg-muted/10"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleLocalUpload(e.target.files)}
              disabled={uploadingLocal}
            />
            {uploadingLocal ? (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground/80">Upload multiple images</p>
                <p className="text-[10px] text-muted-foreground">Drag & drop or click to upload to Cloudinary</p>
              </div>
            )}
          </div>

          {loadingLocal ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading local images...</p>
            </div>
          ) : localImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No images found in public/images</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add images to <code className="bg-muted px-1 rounded">public/images</code> to see them here.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground -mt-2">
                {multiple
                  ? "Click images to add them to the selection."
                  : "Click an image to select it."}{" "}
                Found {localImages.length} image{localImages.length === 1 ? "" : "s"}.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {localImages.map((img) => {
                  const selected = isSelected(img.url);
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => handleSelectLocalImage(img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all hover:ring-2 hover:ring-black/20 ${
                        selected
                          ? "ring-2 ring-black border-black"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-black text-[10px] font-semibold px-2 py-0.5 rounded">
                            Selected
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 text-[9px] bg-black/60 text-white truncate px-1.5 py-0.5">
                        {img.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {multiple && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLocalDialogOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
