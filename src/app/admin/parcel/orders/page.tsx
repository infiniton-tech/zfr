"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminParcelOrdersPage() {
  const [form, setForm] = useState({
    consigneeName: "",
    consigneePhone: "",
    consigneeAddress: "",
    consigneeCity: "",
    weight: "1",
    description: "",
    codAmount: "",
    reference: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/parcel/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          weight: parseFloat(form.weight),
          codAmount: form.codAmount ? parseFloat(form.codAmount) : undefined,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
        toast.success("Parcel order placed");
      } else {
        toast.error(json.error?.message || "Failed to place order");
      }
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-2">Parcel Orders</h1>
      <p className="text-sm text-muted-foreground mb-8">Place delivery orders with your parcel provider</p>

      <div className="max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border p-6 space-y-4">
          <h2 className="text-sm font-medium tracking-wide flex items-center gap-2">
            <Truck className="w-4 h-4" />
            PLACE NEW ORDER
          </h2>

          <div className="space-y-2">
            <Label className="text-xs tracking-wider">CONSIGNEE NAME</Label>
            <Input value={form.consigneeName} onChange={(e) => setForm({ ...form, consigneeName: e.target.value })} className="rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wider">PHONE</Label>
            <Input value={form.consigneePhone} onChange={(e) => setForm({ ...form, consigneePhone: e.target.value })} className="rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wider">ADDRESS</Label>
            <Input value={form.consigneeAddress} onChange={(e) => setForm({ ...form, consigneeAddress: e.target.value })} className="rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wider">CITY</Label>
            <Input value={form.consigneeCity} onChange={(e) => setForm({ ...form, consigneeCity: e.target.value })} className="rounded-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-wider">WEIGHT (KG)</Label>
              <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider">COD AMOUNT</Label>
              <Input value={form.codAmount} onChange={(e) => setForm({ ...form, codAmount: e.target.value })} className="rounded-none" placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wider">DESCRIPTION</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white text-xs font-medium tracking-[0.2em] py-3 hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            {loading ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
        </div>

        <div className="bg-white border border-border p-6">
          <h2 className="text-sm font-medium tracking-wide mb-4">RESULT</h2>
          {result ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Order placed successfully</span>
              </div>
              <pre className="bg-muted p-3 text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Place an order to see the response</p>
          )}
        </div>
      </div>
    </div>
  );
}
