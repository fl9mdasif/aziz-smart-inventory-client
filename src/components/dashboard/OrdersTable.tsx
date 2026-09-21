"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { TOrder } from "@/types";
import { useGetAllOrdersQuery, useCancelOrderMutation } from "@/redux/api/orderApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { RoleGate } from "@/components/shared/RoleGate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { orderStatusToVariant } from "@/lib/status";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

export function OrdersTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  // Any filter change invalidates the current page — jump back to page 1
  // instead of leaving the user stranded on a now-out-of-range page. Reset
  // it right in the handler that changes the filter, not via an effect.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const {
    data: orderList,
    isLoading,
    isError,
  } = useGetAllOrdersQuery({
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const [cancelOrder] = useCancelOrderMutation();

  const handleCancel = async (id: string) => {
    try {
      await cancelOrder({ id }).unwrap();
      toast.success("Order cancelled, stock restored");
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't cancel order");
    }
  };

  const columns: DataTableColumn<TOrder>[] = [
    {
      header: "Date",
      cell: (o) =>
        o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : "—",
    },
    { header: "Product", cell: (o) => o.productName },
    { header: "Qty", cell: (o) => o.quantity },
    { header: "Total", cell: (o) => `৳${o.totalAmount.toLocaleString()}` },
    { header: "Customer", cell: (o) => o.customerName || "—" },
    {
      header: "Status",
      cell: (o) => (
        <StatusBadge
          label={o.status === "cancelled" ? "Cancelled" : "Completed"}
          variant={orderStatusToVariant(o.status)}
        />
      ),
    },
    {
      header: "",
      cell: (o) =>
        o.status !== "cancelled" && (
          <RoleGate allow={["admin", "superAdmin"]}>
            <ConfirmDialog
              title="Cancel order"
              description={`Cancel this sale of "${o.productName}"? Stock will be restored.`}
              confirmLabel="Cancel order"
              triggerLabel="Cancel"
              onConfirm={() => handleCancel(o._id as string)}
            />
          </RoleGate>
        ),
      className: "w-28",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by customer or product..."
          className="w-full sm:max-w-xs"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select value={status} onValueChange={(v) => handleStatusChange(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={orderList?.items}
        isLoading={isLoading}
        isError={isError}
        rowKey={(o) => o._id as string}
        emptyMessage="No orders recorded yet."
      />
      <Pagination meta={orderList?.meta} onPageChange={setPage} />
    </div>
  );
}
