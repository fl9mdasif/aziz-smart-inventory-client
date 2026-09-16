"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TCategory } from "@/types";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/api/categoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function CategoryFormDialog({ category }: { category?: TCategory }) {
  const isEdit = Boolean(category?._id);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [thumbnail, setThumbnail] = useState(category?.thumbnail ?? "");

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const isLoading = creating || updating;

  // Reset fields when the dialog opens (not via effect — this dialog
  // instance stays mounted across multiple open/close cycles, so a plain
  // useState initializer would only apply once).
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
      setThumbnail(category?.thumbnail ?? "");
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, description, thumbnail };
      if (isEdit && category?._id) {
        await updateCategory({ id: category._id, data: payload }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created");
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
            <Button variant="ghost" size="icon-sm" aria-label="Edit category" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {isEdit ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Category
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Thumbnail</Label>
            <ImageUploader initialImageUrl={thumbnail} onUploadSuccess={setThumbnail} />
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
