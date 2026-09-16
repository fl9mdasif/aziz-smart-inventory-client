import { TrendingUp } from "lucide-react";
import { TTopProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopProductsList({ data }: { data: TTopProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          data.map((p) => (
            <div key={p.productId} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{p.productName}</p>
                <p className="text-xs text-muted-foreground">{p.quantitySold} sold</p>
              </div>
              <div className="flex items-center gap-1 font-medium text-emerald-600">
                <TrendingUp className="size-3.5" />
                ৳{p.revenue.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
