"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { formatDistanceToNow, startOfMonth, subDays, formatISO } from "date-fns";
import {
  Package,
  AlertTriangle,
  DollarSign,
  CalendarDays,
  Lock,
  ShoppingCart,
  Boxes,
  UserCog,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { TActivityType } from "@/types";
import { useGetAllProductsQuery, useGetRestockQueueQuery } from "@/redux/api/productApi";
import {
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetSalesByCategoryQuery,
} from "@/redux/api/orderApi";
import { useGetRecentActivitiesQuery } from "@/redux/api/activityApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { TrendKPICard } from "@/components/dashboard/TrendKPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { TopProductsList } from "@/components/dashboard/TopProductsList";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const pctChange = (current: number, previous: number): number | undefined => {
  if (previous === 0) return current > 0 ? 100 : undefined;
  return ((current - previous) / previous) * 100;
};

export default function DashboardPage() {
  const user = useCurrentUser();
  // /products/restock-queue and /orders/analytics/* are admin/superAdmin-only
  // server-side (see route.order.ts / router.product.ts). PRD §2.1 wants these
  // widgets on the Dashboard for every role, but staff would get a 403 — skip
  // the calls for staff and show a locked placeholder instead of an error toast.
  const isPrivileged = user?.role === "admin" || user?.role === "superAdmin";

  const today = formatISO(new Date(), { representation: "date" });
  const thirtyDaysAgo = formatISO(subDays(new Date(), 29), { representation: "date" });
  const twoMonthsAgo = formatISO(subDays(startOfMonth(new Date()), 32), { representation: "date" });

  const { data: productList } = useGetAllProductsQuery({ limit: 1 });
  const { data: restockQueue, isError: restockError } = useGetRestockQueueQuery(undefined, {
    skip: !isPrivileged,
  });

  // one 30-day daily series feeds both the big chart and the KPI sparklines/trends
  const { data: dailySeries, isError: dailySeriesError } = useGetSalesAnalyticsQuery(
    { period: "daily", from: thirtyDaysAgo, to: today },
    { skip: !isPrivileged },
  );
  const { data: monthlySeries, isError: monthlySeriesError } = useGetSalesAnalyticsQuery(
    { period: "monthly", from: twoMonthsAgo, to: today },
    { skip: !isPrivileged },
  );
  const { data: topProducts, isError: topProductsError } = useGetTopProductsQuery(
    { limit: 10 },
    { skip: !isPrivileged },
  );
  const { data: byCategory, isError: byCategoryError } = useGetSalesByCategoryQuery(undefined, {
    skip: !isPrivileged,
  });
  const {
    data: activityList,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useGetRecentActivitiesQuery({ limit: 10 });
  const activities = activityList?.items;

  // These queries fail silently in the UI otherwise (data ?? 0/[] renders the
  // same whether a request 401'd or genuinely returned nothing) — surface it
  // so an expired/invalid token doesn't look like "no sales today".
  const hasFetchError =
    restockError || dailySeriesError || monthlySeriesError || topProductsError || byCategoryError || activitiesError;
  useEffect(() => {
    if (hasFetchError) {
      toast.error("Couldn't load some dashboard data — try logging out and back in.");
    }
  }, [hasFetchError]);

  const totalProducts = productList?.meta?.total ?? 0;
  const lowStockCount = restockQueue?.length ?? 0;

  const series = dailySeries ?? [];
  const todayRevenue = series.find((d) => d.date === today)?.revenue ?? 0;
  const yesterday = formatISO(subDays(new Date(), 1), { representation: "date" });
  const yesterdayRevenue = series.find((d) => d.date === yesterday)?.revenue ?? 0;
  const monthRevenue = monthlySeries?.at(-1)?.revenue ?? 0;
  const prevMonthRevenue = monthlySeries && monthlySeries.length > 1 ? monthlySeries.at(-2)!.revenue : 0;

  const sparkline = series.slice(-7).map((d) => ({ value: d.revenue }));
  const totalRevenue30d = series.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <GreetingHeader username={user?.username ?? ""} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Products" value={totalProducts} icon={Package} />
        {isPrivileged ? (
          <>
            <TrendKPICard label="Low Stock" value={lowStockCount} icon={AlertTriangle} />
            <TrendKPICard
              label="Today's Sales"
              value={`৳${todayRevenue.toLocaleString()}`}
              icon={DollarSign}
              trendPercent={pctChange(todayRevenue, yesterdayRevenue)}
              sparkline={sparkline}
            />
            <TrendKPICard
              label="This Month's Revenue"
              value={`৳${monthRevenue.toLocaleString()}`}
              icon={CalendarDays}
              trendPercent={pctChange(monthRevenue, prevMonthRevenue)}
            />
          </>
        ) : (
          <>
            <KPICard label="Low Stock" value="Admin only" icon={Lock} />
            <KPICard label="Today's Sales" value="Admin only" icon={Lock} />
            <KPICard label="This Month's Revenue" value="Admin only" icon={Lock} />
          </>
        )}
      </div>

      {isPrivileged ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={series} totalRevenue={totalRevenue30d} />
            </div>
            <CategoryBreakdown data={byCategory ?? []} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopProductsList data={topProducts ?? []} />
            <RecentActivityCard activities={activities} isLoading={activitiesLoading} />
          </div>
        </>
      ) : (
        <div className="mt-6">
          <RecentActivityCard activities={activities} isLoading={activitiesLoading} />
        </div>
      )}
    </div>
  );
}

const ACTIVITY_ICON: Record<TActivityType, LucideIcon> = {
  order: ShoppingCart,
  product: Boxes,
  user: UserCog,
  system: Settings2,
};

function RecentActivityCard({
  activities,
  isLoading,
}: {
  activities?: { _id: string; type: TActivityType; message: string; createdAt: string }[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}

        {!isLoading && (!activities || activities.length === 0) && (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        )}

        {activities?.map((activity) => {
          const Icon = ACTIVITY_ICON[activity.type] ?? Settings2;
          return (
            <div
              key={activity._id}
              className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-3.5" />
                </span>
                <span className="truncate">{activity.message}</span>
              </div>
              <span className="shrink-0 pl-4 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
