"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Package, ShoppingCart, User, Settings2 } from "lucide-react";
import { TActivity, TActivityType } from "@/types";
import { useGetRecentActivitiesQuery } from "@/redux/api/activityApi";
import { PageHeader } from "@/components/shared/PageHeader";
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

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { data: activities, isLoading, isError } = useGetRecentActivitiesQuery();

  // The server always returns the last 10 regardless of query params (see
  // activityApi.ts's note) — filtering by type here is client-side only,
  // over whatever those 10 happen to be, not a real server-side query.
  const filtered = (activities ?? []).filter(
    (a: TActivity) => typeFilter === "all" || a.type === typeFilter,
  );

  return (
    <div>
      <PageHeader title="Inventory Activity" description="Recent order, product, and account events" />

      <div className="mb-4">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as string)}>
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

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No activity{typeFilter !== "all" ? ` of type "${typeFilter}"` : ""} yet.
            </p>
          )}

          {!isLoading &&
            !isError &&
            filtered.map((activity: TActivity) => {
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
    </div>
  );
}
