import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TMeta } from "@/types";

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: TMeta | undefined;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  if (totalPages <= 1) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft />
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {meta.page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
