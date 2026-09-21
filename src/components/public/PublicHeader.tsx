import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { LogoMark } from "./LogoMark";

const BUSINESS = {
  name: "Aziz Brother",
  phone: "+8801865-805331",
  whatsapp: "+8801865805331",
  address: "Mirpur Tower, Mirpur-1, Dhaka 1216",
  location: {
    lat: 23.797052,
    lng: 90.353066,
    // Shareable Google Maps link — used for the "Get Directions" CTA. The
    // embeddable iframe URL is built separately from lat/lng (see
    // LocationMap.tsx) since share links can't be embedded directly.
    mapsUrl: "https://share.google/lh193otD3aE1msc8x",
  },
};

// Homepage-relative hash links (`/#products`, not `#products`) so they still
// work correctly when clicked from a different route like /contact.
const NAV_LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/#why-us", label: "Why Us" },
  { href: "/#how-to-buy", label: "How to Buy" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight">
              {BUSINESS.name}
            </h1>
            <p className="text-xs text-muted-foreground">Sewing parts &amp; supplies</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
            <Phone className="size-4" />
            {BUSINESS.phone}
          </a>
          <span className="hidden items-center gap-1.5 xl:flex">
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
