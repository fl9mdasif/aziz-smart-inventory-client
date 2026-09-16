"use client";

import { motion } from "framer-motion";
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
  const items = [{ _id: null, name: "All" }, ...categories.filter((c) => c.isActive)];

  return (
    <div className="flex flex-wrap gap-2 rounded-full border bg-muted/40 p-1.5">
      {items.map((item) => {
        const isActive = activeId === item._id;
        return (
          <button
            key={item._id ?? "all"}
            onClick={() => onSelect(item._id ?? null)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
