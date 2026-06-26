"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, Link2, Plus, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadManagerProps {
  value: string | string[];
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

  // Normalize value to string array for easier internal processing
  const getImagesArray = (): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
  };

  const images = getImagesArray();

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
          }
        } catch (error) {
          console.error("Failed to upload file:", error);
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
    </div>
  );
}
