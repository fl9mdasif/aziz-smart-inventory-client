"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

// A Google Maps share link (BUSINESS.location.mapsUrl) can't be embedded
// directly in an iframe — this is the standard no-API-key embeddable URL,
// built from the same lat/lng instead.
const EMBED_URL = `https://www.google.com/maps?q=${BUSINESS.location.lat},${BUSINESS.location.lng}&z=16&output=embed`;

export function LocationMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-2xl border bg-background shadow-sm"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <iframe
          src={EMBED_URL}
          title={`${BUSINESS.name} location map`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          {BUSINESS.address}
        </p>
        <a
          href={BUSINESS.location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <Navigation className="size-3.5 text-primary" />
          Get Directions
        </a>
      </div>
    </motion.div>
  );
}
