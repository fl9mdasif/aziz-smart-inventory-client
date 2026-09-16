import Image from "next/image";
import { TPublicProduct } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { availabilityToVariant } from "@/lib/status";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const availabilityLabel: Record<TPublicProduct["availability"], string> = {
  "in stock": "In Stock",
  "low stock": "Low Stock",
  "out of stock": "Out of Stock",
};

export function ProductCard({ product }: { product: TPublicProduct }) {
  const isOutOfStock = product.availability === "out of stock";
  const categoryName =
    typeof product.category === "string" ? product.category : product.category.name;

  return (
    <Card
      className={cn(
        "overflow-hidden py-0 transition-opacity",
        isOutOfStock && "opacity-60 grayscale",
      )}
    >
      <div className="relative aspect-square w-full bg-muted">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{categoryName}</p>
        <h3 className="line-clamp-2 font-medium leading-snug">{product.name}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold">৳{product.price.toLocaleString()}</span>
          <StatusBadge
            label={availabilityLabel[product.availability]}
            variant={availabilityToVariant(product.availability)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
