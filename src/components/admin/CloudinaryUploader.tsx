"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Video, Check, Loader2 } from "lucide-react";

interface UploadedFile {
  url: string;
  publicId: string;
  type: "image" | "video";
}

interface CloudinaryUploaderProps {
  onUpload?: (files: UploadedFile[]) => void;
  folder?: string;
  multiple?: boolean;
}

export function CloudinaryUploader({ onUpload, folder = "zfr-products", multiple = true }: CloudinaryUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setUploading(true);
      setProgress(0);
      const uploaded: UploadedFile[] = [];

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
          if (json.data) {
            uploaded.push({
              url: json.data.url,
              publicId: json.data.publicId,
              type: file.type.startsWith("video/") ? "video" : "image",
            });
          }
        } catch {
          // Skip failed uploads
        }
        setProgress(Math.round(((i + 1) / fileList.length) * 100));
      }

      setFiles((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
      setUploading(false);
      onUpload?.(uploaded);
    },
    [folder, multiple, onUpload]
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

  const removeFile = (publicId: string) => {
    setFiles((prev) => prev.filter((f) => f.publicId !== publicId));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-black bg-muted" : "border-border"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
        <label className="inline-block px-4 py-2 bg-black text-white text-xs tracking-wider cursor-pointer hover:bg-black/90 transition-colors">
          SELECT FILES
          <input
            type="file"
            multiple={multiple}
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="bg-white border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Uploading... {progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted overflow-hidden">
            <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file) => (
            <div key={file.publicId} className="relative group aspect-square bg-muted overflow-hidden">
              {file.type === "video" ? (
                <video src={file.url} className="w-full h-full object-cover" />
              ) : (
                <img src={file.url} alt="Uploaded" className="w-full h-full object-cover" />
              )}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeFile(file.publicId)}
                  className="p-1 bg-white/90 hover:bg-white text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {file.type === "video" && (
                <div className="absolute bottom-1 left-1 p-1 bg-black/50 text-white">
                  <Video className="w-3 h-3" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 p-1 bg-green-500 text-white">
                <Check className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL List */}
      {files.length > 0 && (
        <div className="bg-white border border-border p-4">
          <h3 className="text-xs font-medium tracking-wider mb-2">UPLOADED URLS</h3>
          <div className="space-y-1">
            {files.map((file) => (
              <div key={file.publicId} className="flex items-center gap-2 text-xs">
                {file.type === "video" ? <Video className="w-3 h-3 text-muted-foreground" /> : <ImageIcon className="w-3 h-3 text-muted-foreground" />}
                <code className="bg-muted px-2 py-1 truncate flex-1">{file.url}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
