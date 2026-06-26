"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/v1/users/profile");
        const json = await res.json();
        if (res.ok && json.data) {
          setName(json.data.name || "");
          setEmail(json.data.email || "");
          setPhone(json.data.phone || "");
        }
      } catch {
        toast.error("Failed to load profile details");
      } finally {
        setFetching(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully");
        // Update next-auth session cookie with new name
        update({ name });
      } else {
        toast.error(json.error?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = session?.user?.role === "admin";

  if (fetching) {
    return <div className="text-sm text-muted-foreground">Loading profile details...</div>;
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="p-4 bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider">ADMINISTRATOR CONTROL PANEL</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have administrative access to manage ZFR storefront.</p>
          </div>
          <Link
            href="/admin"
            className="self-start sm:self-auto bg-black text-white text-xs font-medium tracking-[0.2em] px-6 py-3 hover:bg-black/90 transition-colors"
          >
            GO TO ADMIN
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium tracking-wide mb-6">PERSONAL INFORMATION</h2>
        <form className="space-y-5 max-w-md" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs tracking-wider">FULL NAME</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-none" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-wider">EMAIL</Label>
            <Input id="email" type="email" value={email} disabled className="rounded-none bg-neutral-100 cursor-not-allowed text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Email address cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs tracking-wider">PHONE</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none" placeholder="+971 XX XXX XXXX" />
          </div>
          <button type="submit" disabled={loading} className="bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black/90 transition-colors disabled:opacity-50">
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
}

