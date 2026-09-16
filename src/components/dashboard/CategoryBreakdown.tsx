import { TSalesByCategoryItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PALETTE = [
  "oklch(0.6 0.16 45)", // brand orange
  "oklch(0.6 0.1 195)", // teal
  "oklch(0.6 0.15 260)", // blue
  "oklch(0.65 0.15 145)", // green
  "oklch(0.6 0.02 45)", // neutral
];

export function CategoryBreakdown({ data }: { data: TSalesByCategoryItem[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No category sales yet.</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => {
              const pct = (item.revenue / total) * 100;
              return (
                <div key={item.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      {item.categoryName}
                    </span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
