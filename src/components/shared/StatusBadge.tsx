import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusVariant } from "@/lib/status";

const variantStyles: Record<StatusVariant, string> = {
  good: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  bad: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  neutral: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
};

export function StatusBadge({
  label,
  variant,
  className,
}: {
  label: string;
  variant: StatusVariant;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(variantStyles[variant], className)}>
      {label}
    </Badge>
  );
}
