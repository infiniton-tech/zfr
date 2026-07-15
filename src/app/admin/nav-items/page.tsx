"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { LinkSelector } from "@/components/admin/LinkSelector";

interface NavItem {
  _id: string;
  label: string;
  href: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
}

const positions = [
  { value: "header-main", label: "Header Main" },
  { value: "header-secondary", label: "Header Secondary" },
  { value: "sidebar", label: "Sidebar" },
  { value: "footer", label: "Footer" },
];

export default function AdminNavItemsPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [form, setForm] = useState({
    label: "",
    href: "",
    position: "header-main",
    sortOrder: "",
    isActive: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/v1/nav-items?limit=100");
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    const body = {
      ...form,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    const res = await fetch(editing ? `/api/v1/nav-items/${editing._id}` : "/api/v1/nav-items", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setForm({ label: "", href: "", position: "header-main", sortOrder: "", isActive: true });
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this nav item?")) return;
    const res = await fetch(`/api/v1/nav-items/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  };

  const startEdit = (item: NavItem) => {
    setEditing(item);
    setForm({
      label: item.label,
      href: item.href,
      position: item.position,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ label: "", href: "", position: "header-main", sortOrder: "", isActive: true });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Navigation Items</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Add Nav Item</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>{editing ? "Edit Nav Item" : "Add Nav Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
            {/* Form Column */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid gap-2">
                <Label>Label *</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Woman" />
              </div>
              <div className="grid gap-2">
                <Label>URL (href) *</Label>
                <LinkSelector value={form.href} onChange={(val) => setForm({ ...form, href: val })} placeholder="e.g. /woman" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Position</Label>
                  <select className="border rounded-md px-3 py-2 text-sm bg-background" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    {positions.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="e.g. 1" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>

            {/* Preview Column */}
            <div className="p-6 bg-muted/20 flex flex-col justify-between max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live Navigation Preview</h3>
                </div>

                <div className="bg-white border border-border p-4 shadow-sm rounded-md transition-all duration-300 space-y-4">
                  {form.position.startsWith("header") ? (
                    <div className="space-y-2 text-left">
                      <span className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground block">Simulated Storefront Header</span>
                      <div className="border rounded-md px-3 py-2.5 bg-white shadow-sm flex items-center justify-between text-black relative h-12 overflow-hidden">
                        {/* Hamburger */}
                        <div className="w-4 h-3 flex flex-col justify-between opacity-60">
                          <span className="h-0.5 w-full bg-black"></span>
                          <span className="h-0.5 w-3/4 bg-black"></span>
                          <span className="h-0.5 w-full bg-black"></span>
                        </div>
                        {/* Nav Items */}
                        <div className="flex gap-3 text-[10px] uppercase tracking-wider font-semibold">
                          {form.position === "header-main" ? (
                            <>
                              <span className="text-black font-bold border-b-2 border-black pb-0.5">{form.label || "New Item"}</span>
                              <span className="text-muted-foreground opacity-60">Woman</span>
                              <span className="text-muted-foreground opacity-60">Man</span>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground opacity-60">Woman</span>
                              <span className="text-muted-foreground opacity-60">Man</span>
                              <span className="text-black font-bold border-b-2 border-black pb-0.5">{form.label || "New Item"}</span>
                            </>
                          )}
                        </div>
                        {/* Logo */}
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase">ZFR</span>
                      </div>
                    </div>
                  ) : form.position === "sidebar" ? (
                    <div className="space-y-2 text-left">
                      <span className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground block">Simulated Sidebar Flyout</span>
                      <div className="border rounded-md p-3 bg-white shadow-sm text-black flex flex-col gap-2 max-w-[200px] w-full">
                        <span className="text-[9px] font-bold text-muted-foreground border-b pb-1">MENU</span>
                        <span className="text-xs text-muted-foreground opacity-60">Home</span>
                        <span className="text-xs text-black font-semibold bg-muted/60 px-2 py-1 rounded-sm border-l-2 border-black flex items-center justify-between">
                          {form.label || "New Item"}
                          <span className="text-[8px] bg-black text-white px-1 py-0.5 font-sans font-normal tracking-normal uppercase">Active</span>
                        </span>
                        <span className="text-xs text-muted-foreground opacity-60">Collections</span>
                        <span className="text-xs text-muted-foreground opacity-60">Contact</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left">
                      <span className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground block">Simulated Storefront Footer</span>
                      <div className="border rounded-md p-4 bg-muted/10 shadow-sm text-black space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div>
                            <span className="text-[8px] font-bold text-muted-foreground block mb-1 uppercase">SHOP</span>
                            <span className="text-[9px] text-muted-foreground block opacity-60">Women's clothing</span>
                            <span className="text-[9px] text-muted-foreground block opacity-60">Men's shoes</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-muted-foreground block mb-1 uppercase">CUSTOMER CARE</span>
                            <span className="text-[9px] text-black font-semibold underline block">{form.label || "New Item"}</span>
                            <span className="text-[9px] text-muted-foreground block opacity-60">FAQ & Returns</span>
                          </div>
                        </div>
                        <div className="border-t pt-2 text-center text-[8px] text-muted-foreground">
                          © 2026 ZFR Fashion E-Commerce. All rights reserved.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground text-center border-t pt-4 mt-4">
                This dynamic simulation shows where the navigation link will render in the customer storefront.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-muted-foreground">{item.href}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                      {item.position.replace("-", " ")}
                    </span>
                  </TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No nav items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
