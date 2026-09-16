"use client";

import Image from "next/image";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import { TCategory } from "@/types";
import {
  useGetAllCategoriesQuery,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
} from "@/redux/api/categoryApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { RoleGate } from "@/components/shared/RoleGate";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CategoryFormDialog } from "@/components/dashboard/CategoryFormDialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function CategoryPage() {
  const user = useCurrentUser();
  const isPrivileged = user?.role === "admin" || user?.role === "superAdmin";

  const { data: categories, isLoading, isError } = useGetAllCategoriesQuery();
  const [toggleStatus] = useToggleCategoryStatusMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleToggle = async (category: TCategory) => {
    try {
      await toggleStatus(category._id as string).unwrap();
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted");
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't delete category");
    }
  };

  const columns: DataTableColumn<TCategory>[] = [
    {
      header: "Thumbnail",
      cell: (c) =>
        c.thumbnail ? (
          <div className="relative size-10 overflow-hidden rounded-md bg-muted">
            <Image src={c.thumbnail} alt={c.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="size-10 rounded-md bg-muted" />
        ),
    },
    { header: "Name", cell: (c) => <span className="font-medium">{c.name}</span> },
    {
      header: "Description",
      cell: (c) => (
        <span className="line-clamp-1 max-w-64 text-muted-foreground">
          {c.description || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (c) =>
        isPrivileged ? (
          <div className="flex items-center gap-2">
            <Switch checked={c.isActive} onCheckedChange={() => handleToggle(c)} />
            <span className="text-sm text-muted-foreground">
              {c.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <Badge variant="outline" className={c.isActive ? "text-emerald-600" : "text-muted-foreground"}>
            {c.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      className: "w-40",
    },
    {
      header: "",
      cell: (c) => (
        <RoleGate allow={["admin", "superAdmin"]}>
          <div className="flex justify-end gap-1">
            <CategoryFormDialog category={c} />
            <ConfirmDialog
              title="Delete category"
              description={`Delete "${c.name}"? This can't be undone.`}
              onConfirm={() => handleDelete(c._id as string)}
            />
          </div>
        </RoleGate>
      ),
      className: "w-24",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Category"
        description="Product categories"
        icon={Tags}
        action={
          <RoleGate allow={["admin", "superAdmin"]}>
            <CategoryFormDialog />
          </RoleGate>
        }
      />
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        isError={isError}
        rowKey={(c) => c._id as string}
        emptyMessage="No categories yet."
      />
    </div>
  );
}
