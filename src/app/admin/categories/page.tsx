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
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import { ImageUploadManager } from "@/components/admin/ImageUploadManager";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  gender: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  image?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    gender: "woman",
    parentId: "",
    sortOrder: "",
    image: "",
  });

  // Multi-select state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/categories?all=true&limit=100");
      const json = await res.json();
      setCategories(json.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async () => {
    const body = {
      ...form,
      slug: (form.slug || form.name.toLowerCase().replace(/\s+/g, "-")).replace(/^\/+|\/+$/g, "").trim().toLowerCase(),
      sortOrder: parseInt(String(form.sortOrder)) || 0,
    };
    const res = await fetch(editing ? `/api/v1/categories/${editing._id}` : "/api/v1/categories", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setForm({ name: "", slug: "", description: "", gender: "woman", parentId: "", sortOrder: "", image: "" });
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also delete subcategories.")) return;
    const res = await fetch(`/api/v1/categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
  };

  // ─── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected categor${selected.size === 1 ? "y" : "ies"}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/v1/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`${json.data.deleted} categor${json.data.deleted === 1 ? "y" : "ies"} deleted`);
        setSelected(new Set());
        fetchCategories();
      } else {
        toast.error(json.error?.message || "Bulk delete failed");
      }
    } catch {
      toast.error("Failed to delete categories");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Select helpers ────────────────────────────────────────────────────────
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) { ids.forEach((id) => next.delete(id)); }
      else { ids.forEach((id) => next.add(id)); }
      return next;
    });
  }

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      gender: cat.gender,
      parentId: cat.parentId || "",
      sortOrder: String(cat.sortOrder),
      image: cat.image || "",
    });
    setOpen(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", gender: "woman", parentId: "", sortOrder: "", image: "" });
    setOpen(true);
  };

  const parents = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter((c) => c.parentId);
  const parentIds = parents.map((c) => c._id);
  const subIds = subcategories.map((c) => c._id);

  const allParentsSelected = parentIds.length > 0 && parentIds.every((id) => selected.has(id));
  const someParentsSelected = parentIds.some((id) => selected.has(id)) && !allParentsSelected;
  const allSubsSelected = subIds.length > 0 && subIds.every((id) => selected.has(id));
  const someSubsSelected = subIds.some((id) => selected.has(id)) && !allSubsSelected;

  // ─── Reusable table builder ────────────────────────────────────────────────
  function CategoryTable({
    title,
    rows,
    rowIds,
    allSelected,
    someSelected,
    isSubcategory = false,
  }: {
    title: string;
    rows: Category[];
    rowIds: string[];
    allSelected: boolean;
    someSelected: boolean;
    isSubcategory?: boolean;
  }) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Master checkbox */}
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={() => toggleAll(rowIds)}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`Select all ${title}`}
                  />
                </TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>{isSubcategory ? "Parent" : "Gender"}</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((cat) => (
                <TableRow
                  key={cat._id}
                  className={selected.has(cat._id) ? "bg-primary/5" : ""}
                  onClick={() => toggleOne(cat._id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(cat._id)}
                      onChange={() => toggleOne(cat._id)}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`Select ${cat.name}`}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                      {cat.image ? (
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{cat.slug}</TableCell>
                  <TableCell className="capitalize">
                    {isSubcategory
                      ? (parents.find((p) => p._id === cat.parentId)?.name || "—")
                      : cat.gender}
                  </TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No {title.toLowerCase()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      {/* ── Bulk action toolbar (appears when items selected) ───────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selected.size} categor{selected.size === 1 ? "y" : "ies"} selected
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : `Delete ${selected.size} Selected`}
          </button>
        </div>
      )}

      {/* ── Add / Edit dialog ──────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
            {/* Form Column */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <select className="border rounded-md px-3 py-2 text-sm bg-background" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Parent</Label>
                  <select className="border rounded-md px-3 py-2 text-sm bg-background" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                    <option value="">Top Level</option>
                    {parents.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="e.g. 1" />
                </div>
              </div>
              <div className="grid gap-2">
                <ImageUploadManager
                  label="Category Image"
                  value={form.image}
                  onChange={(image) => setForm({ ...form, image })}
                  multiple={false}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>

            {/* Preview Column */}
            <div className="p-6 bg-muted/20 flex flex-col justify-between max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live Category Preview</h3>
                </div>
                <div className="border border-border rounded-lg overflow-hidden bg-white shadow-md">
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 max-w-xs mx-auto bg-white border border-border rounded text-[9px] text-muted-foreground py-0.5 px-3 text-center truncate select-none">
                      {`zfr-fashion.com/${form.gender || "woman"}`}
                    </div>
                  </div>
                  <div className="p-4 bg-white max-h-[50vh] overflow-y-auto">
                    <div className="max-w-[200px] mx-auto bg-white border border-border p-3 shadow-xs rounded-xs">
                      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-2">
                        {form.image ? (
                          <img src={form.image} alt={form.name || "Category image"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
                        )}
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground block capitalize">{form.gender} section</span>
                        <span className="text-xs font-semibold tracking-wider uppercase">{form.name || "Category Name"}</span>
                        {form.description && (
                          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{form.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground text-center border-t pt-4 mt-4">
                This is a live representation of the category card shown on the gender landing page grids.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tables ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          <CategoryTable
            title="Parent Categories"
            rows={parents}
            rowIds={parentIds}
            allSelected={allParentsSelected}
            someSelected={someParentsSelected}
          />
          <CategoryTable
            title="Subcategories"
            rows={subcategories}
            rowIds={subIds}
            allSelected={allSubsSelected}
            someSelected={someSubsSelected}
            isSubcategory
          />
        </div>
      )}
    </div>
  );
}
