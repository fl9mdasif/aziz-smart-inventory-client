"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { TProduct } from "@/types";
import { useCreateProductMutation, useUpdateProductMutation, useGetProductMetaQuery } from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { slugify } from "@/utils/slugify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ComboboxAddNew } from "@/components/shared/ComboboxAddNew";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/services/ImageUploader";

interface VariantRow {
  thickness: string;
  width: string;
  length: string;
  price: string;
  stockQuantity: string;
  minStockThreshold: string;
}

const emptyRow: VariantRow = {
  thickness: "",
  width: "",
  length: "",
  price: "",
  stockQuantity: "",
  minStockThreshold: "",
};

const toVariantRow = (v: TProduct["variants"][number]): VariantRow => ({
  thickness: String(v.thickness),
  width: String(v.width),
  length: String(v.length),
  price: String(v.price),
  stockQuantity: String(v.stockQuantity),
  minStockThreshold: String(v.minStockThreshold),
});

const sizeLabelPreview = (row: VariantRow): string =>
  row.thickness && row.width ? `${row.thickness}mm x ${row.width}mm` : "—";

export function ProductFormDialog({ product }: { product?: TProduct }) {
  const isEdit = Boolean(product?._id);
  const [open, setOpen] = useState(false);

  const [modelNo, setModelNo] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [brand, setBrand] = useState("");
  const [moq, setMoq] = useState("");
  const [samplesAvailable, setSamplesAvailable] = useState(false);
  const [transportPackage, setTransportPackage] = useState("");
  const [origin, setOrigin] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [note, setNote] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([emptyRow]);

  const { data: categories } = useGetAllCategoriesQuery();
  const { data: meta } = useGetProductMetaQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const isLoading = creating || updating;

  // Reset fields when the dialog opens (not via effect — this dialog
  // instance stays mounted across multiple open/close cycles).
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setModelNo(product?.modelNo ?? "");
      setName(product?.name ?? "");
      setDescription(product?.description ?? "");
      setCategoryId(
        typeof product?.category === "string" ? product.category : product?.category?._id ?? "",
      );
      setThumbnail(product?.thumbnail ?? "");
      setBrand(product?.brand ?? "");
      setMoq(product?.moq ?? "");
      setSamplesAvailable(product?.samplesAvailable ?? false);
      setTransportPackage(product?.transportPackage ?? "");
      setOrigin(product?.origin ?? "");
      setHsCode(product?.hsCode ?? "");
      setNote(product?.note ?? "");
      setVariants(product?.variants?.length ? product.variants.map(toVariantRow) : [emptyRow]);
    }
    setOpen(next);
  };

  const updateRow = (index: number, field: keyof VariantRow, value: string) => {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setVariants((rows) => [...rows, emptyRow]);
  const removeRow = (index: number) =>
    setVariants((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedVariants = variants.map((row) => ({
      thickness: Number(row.thickness),
      width: Number(row.width),
      length: Number(row.length),
      price: Number(row.price),
      stockQuantity: row.stockQuantity ? Number(row.stockQuantity) : 0,
      minStockThreshold: row.minStockThreshold ? Number(row.minStockThreshold) : 5,
    }));

    if (parsedVariants.some((v) => !v.thickness || !v.width || !v.length || !v.price)) {
      toast.error("Every size needs thickness, width, length, and price");
      return;
    }

    try {
      const payload = {
        modelNo,
        name,
        slug: slugify(name),
        description,
        category: categoryId,
        thumbnail,
        brand: brand || undefined,
        moq: moq || undefined,
        samplesAvailable,
        transportPackage: transportPackage || undefined,
        origin: origin || undefined,
        hsCode: hsCode || undefined,
        note: note || undefined,
        variants: parsedVariants,
      };
      if (isEdit && product?._id) {
        await updateProduct({ id: product._id, data: payload }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created");
      }
      setOpen(false);
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit product" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {isEdit ? (
          <Pencil className="size-4" />
        ) : (
          <>
            <Plus className="size-4" />
            New Product
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-6 overflow-y-auto pr-1">
          {/* ── Product details ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prod-modelno">Model No.</Label>
                <Input
                  id="prod-modelno"
                  value={modelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                  placeholder="e.g. KB040B"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-name">Name</Label>
                <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c._id} value={c._id as string}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Thumbnail</Label>
              <ImageUploader initialImageUrl={thumbnail} onUploadSuccess={setThumbnail} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <ComboboxAddNew value={brand} onChange={setBrand} options={meta?.brand ?? []} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-moq">MOQ</Label>
                <Input id="prod-moq" value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="e.g. 1 PC" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Transport Package</Label>
                <ComboboxAddNew
                  value={transportPackage}
                  onChange={setTransportPackage}
                  options={meta?.transportPackage ?? []}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Origin</Label>
                <ComboboxAddNew value={origin} onChange={setOrigin} options={meta?.origin ?? []} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prod-hscode">HS Code</Label>
                <Input id="prod-hscode" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={samplesAvailable} onCheckedChange={setSamplesAvailable} />
                <span className="text-sm">Samples available</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-note">Note</Label>
              <Textarea id="prod-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {/* ── Sizes (variants) ─────────────────────────────────────────── */}
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label>Sizes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="size-4" />
                Add size
              </Button>
            </div>

            {variants.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-end gap-2 border-t pt-3 first:border-0 first:pt-0">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Thickness (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={row.thickness}
                    onChange={(e) => updateRow(i, "thickness", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Width (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={row.width}
                    onChange={(e) => updateRow(i, "width", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Length (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={row.length}
                    onChange={(e) => updateRow(i, "length", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Price (৳)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.price}
                    onChange={(e) => updateRow(i, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.stockQuantity}
                    onChange={(e) => updateRow(i, "stockQuantity", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min. threshold</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.minStockThreshold}
                    onChange={(e) => updateRow(i, "minStockThreshold", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  disabled={variants.length === 1}
                  onClick={() => removeRow(i)}
                  aria-label="Remove size"
                >
                  <Trash2 className="size-4" />
                </Button>
                <p className="col-span-full -mt-1 text-xs text-muted-foreground">
                  SKU size label: {sizeLabelPreview(row)}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
