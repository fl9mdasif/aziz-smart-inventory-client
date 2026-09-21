"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, MessageCircle, Ship } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { BUSINESS } from "./PublicHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Homepage-relative hash links so they still work from a different route
// like /contact (see the same note in PublicHeader.tsx).
const BASE_QUICK_LINKS = [
  { href: "/#products", label: "Available stock" },
  { href: "/#why-us", label: "Why choose us" },
  { href: "/contact", label: "Contact us" },
];

export function PublicFooter() {
  const user = useCurrentUser();
  // Undefined (not yet resolved client-side) defaults to the logged-out
  // link so there's no flash from "Dashboard" to "Staff Login" on load.
  const authLink = user
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Staff Login" };
  const quickLinks = [...BASE_QUICK_LINKS, authLink];

  return (
    <footer
      className="mt-auto border-t"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--primary), transparent 95%), color-mix(in oklch, var(--muted), transparent 20%))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]"
      >
        {/* Brand + concept blurb */}
        <div>
          <div className="flex items-center gap-3">
            <LogoMark />
            <p className="font-semibold">{BUSINESS.name}</p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            We import genuine sewing-machine parts and accessories from China on a regular cycle
            and stock them locally, so tailors and garment shops always have a source nearby.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Ship className="size-3.5" />
            Regular shipments, straight from China
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold">Visit or Contact Us</p>
          <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
              <Phone className="size-4 shrink-0 text-primary" />
              {BUSINESS.phone}
            </a>
            <a
              href={`https://wa.me/${BUSINESS.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <MessageCircle className="size-4 shrink-0 text-emerald-500" />
              WhatsApp us
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              {BUSINESS.address}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-primary" />
              Sat–Thu, 9:00 AM – 8:00 PM
            </p>
          </div>
        </div>
      </motion.div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
          <p>In-person sales only — no online checkout or delivery.</p>
        </div>
      </div>
    </footer>
  );
}
