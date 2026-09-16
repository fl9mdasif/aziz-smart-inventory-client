"use client";

import { TProduct, TRestockProduct } from "@/types";
import { useGetAllProductsQuery, useGetRestockQueueQuery } from "@/redux/api/productApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { computeRestockPriority, productStatusToVariant, productStatusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";

export default function LowStockPage() {
  const user = useCurrentUser();
  const isPrivileged = user?.role === "admin" || user?.role === "superAdmin";

  // admin/superAdmin: the real restock-queue endpoint (server-sorted, excludes
  // restockIgnored). staff can't call that endpoint (403) — PRD §3 still wants
  // them to see this page, so fall back to GET /products?lowStockOnly=true,
  // which any authenticated role can call, and compute an equivalent priority.
  const { data: restockQueue, isLoading: rqLoading, isError: rqError } = useGetRestockQueueQuery(
    undefined,
    { skip: !isPrivileged },
  );
  const {
    data: fallbackList,
    isLoading: fbLoading,
    isError: fbError,
  } = useGetAllProductsQuery({ lowStockOnly: true, limit: 100 }, { skip: isPrivileged });

  const rows: TRestockProduct[] = isPrivileged
    ? restockQueue ?? []
    : ((fallbackList?.items ?? []) as TProduct[])
        .map((p) => ({
          ...p,
          priority: computeRestockPriority(p.stockQuantity ?? 0, p.minStockThreshold ?? 5),
        }))
        .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));

  const columns: DataTableColumn<TRestockProduct>[] = [
    { header: "Product", cell: (p) => <span className="font-medium">{p.name}</span> },
    {
      header: "Category",
      cell: (p) => (typeof p.category === "string" ? p.category : p.category?.name) || "—",
    },
    { header: "Stock", cell: (p) => p.stockQuantity ?? 0 },
    { header: "Threshold", cell: (p) => p.minStockThreshold ?? "—" },
    {
      header: "Status",
      cell: (p) => (
        <StatusBadge label={productStatusLabel(p.status)} variant={productStatusToVariant(p.status)} />
      ),
    },
    { header: "Priority", cell: (p) => p.priority },
  ];

  return (
    <div>
      <PageHeader title="Low Stock Quantity" description="Products at or below their restock threshold" />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isPrivileged ? rqLoading : fbLoading}
        isError={isPrivileged ? rqError : fbError}
        rowKey={(p) => p._id as string}
        emptyMessage="Nothing needs restocking right now."
        rowClassName={(p) =>
          cn(p.status === "out_of_stock" && "bg-red-50 dark:bg-red-500/5")
        }
      />
    </div>
  );
}
