"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TProduct } from "@/types";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil } from "lucide-react";

export function ProductFormDialog({ product }: { product?: TProduct }) {
  const isEdit = Boolean(product?._id);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minStockThreshold, setMinStockThreshold] = useState("");

  const { data: categories } = useGetAllCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const isLoading = creating || updating;

  // Reset fields when the dialog opens (not via effect — see the identical
  // note in CategoryFormDialog).
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(product?.name ?? "");
      setDescription(product?.description ?? "");
      setCategoryId(
        typeof product?.category === "string" ? product.category : product?.category?._id ?? "",
      );
      setThumbnail(product?.thumbnail ?? "");
      setPrice(product?.price != null ? String(product.price) : "");
      setStockQuantity(product?.stockQuantity != null ? String(product.stockQuantity) : "");
      setMinStockThreshold(
        product?.minStockThreshold != null ? String(product.minStockThreshold) : "",
      );
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        category: categoryId,
        thumbnail,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        minStockThreshold: minStockThreshold ? Number(minStockThreshold) : undefined,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Name</Label>
            <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Price (৳)</Label>
              <Input
                id="prod-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock">Stock</Label>
              <Input
                id="prod-stock"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-threshold">Min. threshold</Label>
              <Input
                id="prod-threshold"
                type="number"
                min={0}
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(e.target.value)}
              />
            </div>
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
