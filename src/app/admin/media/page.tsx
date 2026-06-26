"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, Check } from "lucide-react";
import Image from "next/image";

export default function AdminMediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; public_id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok) {
        setResult({ url: json.data?.secure_url || json.data?.url, public_id: json.data?.public_id });
      } else {
        alert(json.error?.message || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Media Upload</h1>

      <div className="max-w-xl space-y-4">
        <div className="grid gap-2">
          <Label>Image / Video File</Label>
          <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload to Cloudinary"}
        </Button>
      </div>

      {result && (
        <div className="border rounded-lg p-4 space-y-4 max-w-xl">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <Image src={result.url} alt="Uploaded" fill className="object-contain" sizes="600px" />
          </div>
          <div className="flex items-center gap-2">
            <Input value={result.url} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={copyUrl}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Public ID: {result.public_id}</p>
        </div>
      )}
    </div>
  );
}
