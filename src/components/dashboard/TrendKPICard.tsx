"use client";

import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TrendKPICard({
  label,
  value,
  icon: Icon,
  trendPercent,
  sparkline,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** signed % change vs. the prior period; omit if there's no real comparison to show */
  trendPercent?: number;
  /** last N data points for the mini trend line; omit to render without one */
  sparkline?: { value: number }[];
}) {
  const isUp = (trendPercent ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
          <div className="rounded-full bg-muted p-2">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {trendPercent !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                isUp ? "text-emerald-600" : "text-red-600",
              )}
            >
              {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(trendPercent as number).toFixed(1)}%
            </span>
          ) : (
            <span />
          )}

          {sparkline && sparkline.length > 1 && (
            <div className="h-8 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline}>
                  <defs>
                    <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                    fill={`url(#spark-${label})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
