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
import Image from "next/image";
import { ImageUploadManager } from "@/components/admin/ImageUploadManager";

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    const body = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

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

                {/* Simulated browser window */}
                <div className="border border-border rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300">
                  {/* Browser top-bar */}
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    </div>
                    <div className="flex-1 max-w-xs mx-auto bg-white border border-border rounded text-[9px] text-muted-foreground py-0.5 px-3 text-center truncate select-none">
                      {`zfr-fashion.com/${form.gender || "woman"}`}
                    </div>
                  </div>
                  
                  {/* Browser content viewport */}
                  <div className="p-4 bg-white max-h-[50vh] overflow-y-auto">
                    <div className="max-w-[200px] mx-auto bg-white border border-border p-3 shadow-xs rounded-xs">
                      {/* Simulated Category Card */}
                      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-2">
                        {form.image ? (
                          <img
                            src={form.image}
                            alt={form.name || "Category image"}
                            className="w-full h-full object-cover"
                          />
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

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Parent Categories</h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="w-20">Sort Order</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="capitalize">{cat.gender}</TableCell>
                      <TableCell>{cat.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {parents.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No categories</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Subcategories</h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="w-20">Sort Order</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                          {cat.image ? (
                            <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="capitalize">{parents.find((p) => p._id === cat.parentId)?.name || "—"}</TableCell>
                      <TableCell>{cat.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subcategories.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No subcategories</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
