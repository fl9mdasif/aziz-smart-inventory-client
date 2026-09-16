"use client";

import { TProduct, TRestockRow } from "@/types";
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

  // admin/superAdmin: the real restock-queue endpoint — one row per
  // low/out-of-stock variant (size), server-sorted, excludes restockIgnored.
  // staff can't call that endpoint (403) — PRD §3 still wants them to see
  // this page, so fall back to GET /products?lowStockOnly=true (any
  // authenticated role can call it) and flatten+compute the same shape.
  const { data: restockQueue, isLoading: rqLoading, isError: rqError } = useGetRestockQueueQuery(
    undefined,
    { skip: !isPrivileged },
  );
  const {
    data: fallbackList,
    isLoading: fbLoading,
    isError: fbError,
  } = useGetAllProductsQuery({ lowStockOnly: true, limit: 100 }, { skip: isPrivileged });

  const rows: TRestockRow[] = isPrivileged
    ? restockQueue ?? []
    : ((fallbackList?.items ?? []) as TProduct[])
        .flatMap((product) =>
          (product.variants ?? [])
            .filter((v) => v.status === "low_stock" || v.status === "out_of_stock")
            .map((variant) => ({
              productId: product._id as string,
              modelNo: product.modelNo,
              name: product.name,
              thumbnail: product.thumbnail,
              category:
                typeof product.category === "string"
                  ? null
                  : { _id: product.category._id as string, name: product.category.name, slug: product.category.slug ?? "" },
              variantId: variant._id as string,
              sku: variant.sku,
              sizeLabel: variant.sizeLabel,
              thickness: variant.thickness,
              width: variant.width,
              stockQuantity: variant.stockQuantity,
              minStockThreshold: variant.minStockThreshold,
              status: variant.status,
              priority: computeRestockPriority(variant.stockQuantity, variant.minStockThreshold),
            })),
        )
        .sort((a, b) => a.stockQuantity - b.stockQuantity);

  const columns: DataTableColumn<TRestockRow>[] = [
    {
      header: "Product",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.modelNo}</p>
        </div>
      ),
    },
    { header: "Size", cell: (r) => r.sizeLabel },
    { header: "Category", cell: (r) => r.category?.name || "—" },
    { header: "Stock", cell: (r) => r.stockQuantity },
    { header: "Threshold", cell: (r) => r.minStockThreshold },
    {
      header: "Status",
      cell: (r) => (
        <StatusBadge label={productStatusLabel(r.status)} variant={productStatusToVariant(r.status)} />
      ),
    },
    { header: "Priority", cell: (r) => r.priority },
  ];

  return (
    <div>
      <PageHeader title="Low Stock Quantity" description="Sizes at or below their restock threshold" />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isPrivileged ? rqLoading : fbLoading}
        isError={isPrivileged ? rqError : fbError}
        rowKey={(r) => `${r.productId}-${r.variantId}`}
        emptyMessage="Nothing needs restocking right now."
        rowClassName={(r) => cn(r.status === "out_of_stock" && "bg-red-50 dark:bg-red-500/5")}
      />
    </div>
  );
}
