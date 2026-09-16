"use client";

import { useState } from "react";
import { formatISO, subDays, subMonths, subYears } from "date-fns";
import {
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetSalesByCategoryQuery,
} from "@/redux/api/orderApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageHeader } from "@/components/shared/PageHeader";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { TopProductsList } from "@/components/dashboard/TopProductsList";
import { KPICard } from "@/components/shared/KPICard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Calculator, Lock } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const RANGE_START: Record<Period, () => Date> = {
  daily: () => subDays(new Date(), 29),
  weekly: () => subDays(new Date(), 84), // ~12 weeks
  monthly: () => subMonths(new Date(), 11),
  yearly: () => subYears(new Date(), 4),
};

export default function SalesPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const user = useCurrentUser();
  // /orders/analytics/* is admin/superAdmin-only server-side (route.order.ts),
  // even though PRD §3 defaults this page to staff-visible too since it's
  // read-only. There's no staff-accessible equivalent for full sales
  // analytics (unlike restock-queue's lowStockOnly fallback), so staff see a
  // locked notice here rather than a 403.
  const isPrivileged = user?.role === "admin" || user?.role === "superAdmin";

  const today = formatISO(new Date(), { representation: "date" });
  const from = formatISO(RANGE_START[period](), { representation: "date" });

  const { data: series } = useGetSalesAnalyticsQuery(
    { period, from, to: today },
    { skip: !isPrivileged },
  );
  const { data: topProducts } = useGetTopProductsQuery({ limit: 5 }, { skip: !isPrivileged });
  const { data: byCategory } = useGetSalesByCategoryQuery(undefined, { skip: !isPrivileged });

  const rows = series ?? [];
  const totalRevenue = rows.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = rows.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <PageHeader
        title="Sales tracking"
        description="Revenue over time, top products, and category breakdown"
        action={
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isPrivileged ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard label="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon={DollarSign} />
            <KPICard label="Total Orders" value={totalOrders} icon={ShoppingBag} />
            <KPICard
              label="Average Order Value"
              value={`৳${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              icon={Calculator}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={rows} totalRevenue={totalRevenue} />
            </div>
            <CategoryBreakdown data={byCategory ?? []} />
          </div>

          <div className="mt-4">
            <TopProductsList data={topProducts ?? []} />
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Lock className="size-6" />
            <p className="text-sm">
              Sales analytics are currently admin/superAdmin only on the server.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
