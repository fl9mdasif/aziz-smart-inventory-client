"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Package, ShoppingCart, User, Settings2 } from "lucide-react";
import { TActivity, TActivityType } from "@/types";
import { useGetRecentActivitiesQuery } from "@/redux/api/activityApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_ICON: Record<TActivityType, typeof Package> = {
  order: ShoppingCart,
  product: Package,
  user: User,
  system: Settings2,
};

const PAGE_SIZE = 10;

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Changing the type filter invalidates the current page — jump back to
  // page 1 right in the handler, not via an effect.
  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const {
    data: activityList,
    isLoading,
    isError,
  } = useGetRecentActivitiesQuery({
    type: typeFilter !== "all" ? (typeFilter as TActivityType) : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const activities = activityList?.items ?? [];

  return (
    <div>
      <PageHeader title="Inventory Activity" description="Recent order, product, and account events" />

      <div className="mb-4">
        <Select value={typeFilter} onValueChange={(v) => handleTypeChange(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="order">Order</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}

          {!isLoading && isError && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Couldn&apos;t load activity right now.
            </p>
          )}

          {!isLoading && !isError && activities.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No activity{typeFilter !== "all" ? ` of type "${typeFilter}"` : ""} yet.
            </p>
          )}

          {!isLoading &&
            !isError &&
            activities.map((activity: TActivity) => {
              const Icon = TYPE_ICON[activity.type] ?? Settings2;
              return (
                <div key={activity._id} className="flex items-center gap-3 p-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
        </CardContent>
      </Card>
      <Pagination meta={activityList?.meta} onPageChange={setPage} />
    </div>
  );
}
