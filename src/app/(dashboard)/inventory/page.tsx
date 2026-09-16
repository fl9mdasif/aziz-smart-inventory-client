"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, Package } from "lucide-react";
import { toast } from "sonner";
import { TProduct, TProductStatus } from "@/types";
import { useGetAllProductsQuery, useDeleteProductMutation } from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { RoleGate } from "@/components/shared/RoleGate";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProductFormDialog } from "@/components/dashboard/ProductFormDialog";
import { productStatusToVariant, productStatusLabel } from "@/lib/status";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(search);

  const { data: categories } = useGetAllCategoriesQuery();
  const {
    data: productList,
    isLoading,
    isError,
  } = useGetAllProductsQuery({
    search: debouncedSearch || undefined,
    category: categoryId !== "all" ? categoryId : undefined,
    status: status !== "all" ? status : undefined,
    limit: 50,
  });
  const [deleteProduct] = useDeleteProductMutation();

  const products = (productList?.items ?? []) as TProduct[];

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted");
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't delete product");
    }
  };

  const columns: DataTableColumn<TProduct>[] = [
    {
      header: "",
      cell: (p) =>
        p.thumbnail ? (
          <div className="relative size-10 overflow-hidden rounded-md bg-muted">
            <Image src={p.thumbnail} alt={p.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="size-10 rounded-md bg-muted" />
        ),
      className: "w-14",
    },
    { header: "Name", cell: (p) => <span className="font-medium">{p.name}</span> },
    {
      header: "Category",
      cell: (p) => (typeof p.category === "string" ? p.category : p.category?.name) || "—",
    },
    { header: "Price", cell: (p) => `৳${p.price.toLocaleString()}` },
    { header: "Stock", cell: (p) => p.stockQuantity ?? 0 },
    {
      header: "Status",
      cell: (p) => (
        <StatusBadge
          label={productStatusLabel(p.status)}
          variant={productStatusToVariant(p.status)}
        />
      ),
    },
    {
      header: "",
      cell: (p) => (
        <RoleGate allow={["admin", "superAdmin"]}>
          <div className="flex justify-end gap-1">
            <ProductFormDialog product={p} />
            <ConfirmDialog
              title="Delete product"
              description={`Delete "${p.name}"? This can't be undone.`}
              onConfirm={() => handleDelete(p._id as string)}
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
        title="Inventory / Product"
        description="Manage stock and product details"
        icon={Package}
        action={
          <RoleGate allow={["admin", "superAdmin"]}>
            <ProductFormDialog />
          </RoleGate>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-background p-3 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c._id} value={c._id as string}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={"active" satisfies TProductStatus}>Active</SelectItem>
            <SelectItem value={"low_stock" satisfies TProductStatus}>Low Stock</SelectItem>
            <SelectItem value={"out_of_stock" satisfies TProductStatus}>Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={isError}
        rowKey={(p) => p._id as string}
        emptyMessage="No products yet."
      />
    </div>
  );
}
