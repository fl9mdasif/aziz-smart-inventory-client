"use client";

import { TCategory } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  categories,
  activeId,
  onSelect,
}: {
  categories: TCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-sm transition-colors",
          activeId === null
            ? "border-foreground bg-foreground text-background"
            : "hover:bg-muted",
        )}
      >
        All
      </button>
      {categories
        .filter((c) => c.isActive)
        .map((category) => (
          <button
            key={category._id}
            onClick={() => onSelect(category._id ?? null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              activeId === category._id
                ? "border-foreground bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {category.name}
          </button>
        ))}
    </div>
  );
}
