import { Phone, MapPin, Clock } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { BUSINESS } from "./PublicHeader";

export function PublicFooter() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--primary), transparent 95%), color-mix(in oklch, var(--muted), transparent 20%))",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <p className="font-semibold">{BUSINESS.name}</p>
        </div>
        <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {BUSINESS.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            {BUSINESS.phone}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Sat–Thu, 9:00 AM – 8:00 PM
          </p>
        </div>
      </div>
    </footer>
  );
}
