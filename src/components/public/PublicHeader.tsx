import { Phone, MapPin } from "lucide-react";

// TODO: replace with the owner's real business info (phone/WhatsApp/address).
const BUSINESS = {
  name: "Aziz Brothers",
  phone: "+880-1XXX-XXXXXX",
  address: "Dhaka, Bangladesh",
};

export function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{BUSINESS.name}</h1>
          <p className="text-sm text-muted-foreground">Industrial parts &amp; supplies</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
            <Phone className="size-4" />
            {BUSINESS.phone}
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {BUSINESS.address}
          </span>
        </div>
      </div>
    </header>
  );
}

export { BUSINESS };
