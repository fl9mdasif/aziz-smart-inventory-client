"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, Sparkles } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

export function Hero({ productCount }: { productCount?: number }) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Two-tone mesh gradient — warm primary top-left, cool teal bottom-right —
          so the hero reads as designed rather than flat white. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, color-mix(in oklch, var(--primary), transparent 72%) 0%, transparent 65%), " +
            "radial-gradient(50% 45% at 90% 15%, color-mix(in oklch, oklch(0.6 0.1 195), transparent 78%) 0%, transparent 65%), " +
            "radial-gradient(60% 40% at 50% 100%, color-mix(in oklch, var(--primary), transparent 85%) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklch, var(--foreground), transparent 88%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          <Sparkles className="size-3.5" />
          Visit us in person — no online checkout
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          Industrial parts &amp; supplies,{" "}
          <span
            className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent"
          >
            in stock and ready
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          {BUSINESS.name} imports and stocks rubber sheet rolls, fusing belt parts, and more.
          Check what&apos;s available now, then call or come by to buy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="size-4" />
            Call {BUSINESS.phone}
          </a>
          <a
            href={`https://wa.me/${BUSINESS.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-4 text-emerald-500" />
            WhatsApp us
          </a>
        </motion.div>

        {productCount !== undefined && productCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">{productCount}</span> products
            currently tracked in stock
          </motion.p>
        )}
      </div>
    </section>
  );
}
