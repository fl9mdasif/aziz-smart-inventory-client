import { BUSINESS } from "./PublicHeader";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">{BUSINESS.name}</p>
        <p className="mt-1">{BUSINESS.address}</p>
        <p className="mt-1">{BUSINESS.phone}</p>
        <p className="mt-1">Business hours: Sat–Thu, 9:00 AM – 8:00 PM</p>
      </div>
    </footer>
  );
}
