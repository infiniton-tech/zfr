"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United Arab Emirates");
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/v1/users/addresses");
      const json = await res.json();
      if (res.ok) {
        setAddresses(json.data || []);
      } else {
        toast.error(json.error?.message || "Failed to load addresses");
      }
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zip || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/users/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ street, city, state, zip, country, isDefault }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Address added successfully");
        setShowForm(false);
        // Reset form
        setStreet("");
        setCity("");
        setState("");
        setZip("");
        setCountry("United Arab Emirates");
        setIsDefault(false);
        fetchAddresses();
      } else {
        toast.error(json.error?.message || "Failed to add address");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/v1/users/addresses?addressId=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(json.error?.message || "Failed to delete address");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return (
    <div>
      <h2 className="text-sm font-medium tracking-wide mb-6">MY ADDRESSES</h2>
      
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-black text-white text-xs font-medium tracking-[0.2em] px-6 py-3 hover:bg-black/90 transition-colors"
        >
          ADD NEW ADDRESS
        </button>
      )}

      {showForm && (
        <form className="space-y-4 max-w-md border border-border p-6 mb-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="street" className="text-xs tracking-wider">STREET</Label>
            <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} className="rounded-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs tracking-wider">CITY</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-none" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-xs tracking-wider">STATE</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="rounded-none" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-xs tracking-wider">ZIP CODE</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} className="rounded-none" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-xs tracking-wider">COUNTRY</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-none" required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-3 h-3"
            />
            <Label htmlFor="default" className="text-xs">Set as default address</Label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="bg-black text-white text-xs font-medium tracking-[0.2em] px-6 py-3 hover:bg-black/90 transition-colors disabled:opacity-50">
              {submitting ? "SAVING..." : "SAVE"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs tracking-[0.2em] px-6 py-3 border border-border hover:border-foreground transition-colors">
              CANCEL
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="border border-border p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {addr.isDefault && (
                    <span className="bg-neutral-100 text-[10px] font-semibold px-2 py-0.5 tracking-wider uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{addr.street}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p className="text-xs text-muted-foreground">{addr.country}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
