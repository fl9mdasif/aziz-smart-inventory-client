"use client";

import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TSalesAnalyticsItem } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RevenueChart({
  data,
  totalRevenue,
}: {
  data: TSalesAnalyticsItem[];
  totalRevenue: number;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? format(parseISO(d.date), "MMM d") : d.date,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between space-y-0">
        <div>
          <p className="text-sm text-muted-foreground">Overall Earnings</p>
          <p className="text-2xl font-semibold">৳{totalRevenue.toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent className="h-64 pl-0">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No sales in this period yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                formatter={(value) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#revenue-fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
