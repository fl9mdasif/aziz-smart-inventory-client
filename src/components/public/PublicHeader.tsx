import { Phone, MapPin } from "lucide-react";
import { LogoMark } from "./LogoMark";

// TODO: replace with the owner's real business info (phone/WhatsApp/address).
const BUSINESS = {
  name: "Aziz Brothers",
  phone: "+880-1XXX-XXXXXX",
  whatsapp: "8801XXXXXXXXX",
  address: "Dhaka, Bangladesh",
};

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight">
              {BUSINESS.name}
            </h1>
            <p className="text-xs text-muted-foreground">Industrial parts &amp; supplies</p>
          </div>
        </div>
        <div className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
            <Phone className="size-4" />
            {BUSINESS.phone}
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {BUSINESS.address}
          </span>
        </div>
        <a
          href={`tel:${BUSINESS.phone}`}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:hidden"
        >
          Call
        </a>
      </div>
    </header>
  );
}

export { BUSINESS };
