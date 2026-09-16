export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground ${className ?? ""}`}
    >
      AB
    </div>
  );
}
