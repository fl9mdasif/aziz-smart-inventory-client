"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MessageCircle, Sparkles, Ship, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

const SLIDES = [
  { src: "/assets/hero/h-1.jpg", alt: "Industrial sewing machine mechanism" },
  { src: "/assets/hero/h-2.jpg", alt: "Sewing machine presser feet set" },
  { src: "/assets/hero/h-3.png", alt: "Sewing machine parts breakdown reference" },
];

const AUTOPLAY_MS = 4500;

export function Hero({ productCount }: { productCount?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

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

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center md:gap-8">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div className="text-center md:text-left">
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
            className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
          >
            Genuine sewing machine parts,{" "}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              imported fresh from China
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:mx-0 sm:text-lg"
          >
            {BUSINESS.name} brings in regular shipments of sewing-machine parts and accessories
            direct from China and keeps them in stock. Search what&apos;s available now, then
            call or come by to buy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
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
            <a
              href="#products"
              className="flex items-center gap-1.5 px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse stock
              <ArrowDown className="size-3.5" />
            </a>
          </motion.div>
        </div>

        {/* ── Framed image slider ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xs sm:max-w-sm md:mx-0 md:max-w-md"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Blurred color blobs behind the card for depth */}
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-70 blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--primary), transparent 55%), color-mix(in oklch, oklch(0.6 0.1 195), transparent 65%))",
            }}
          />

          <div className="group relative aspect-square w-full -rotate-1 overflow-hidden rounded-[1.75rem] border bg-muted shadow-2xl transition-transform duration-300 hover:rotate-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={SLIDES[index].src}
                  alt={SLIDES[index].alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 90vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Prev / next controls */}
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Dots */}
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  aria-label={`Show slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-background" : "w-1.5 bg-background/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Floating badge: the China-import concept, front and center */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.55, type: "spring", stiffness: 260, damping: 20 }}
            className="absolute -top-4 right-2 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-lg sm:right-4"
          >
            <Ship className="size-3.5 text-primary" />
            Imported direct from China
          </motion.div>

          {/* Floating badge: live stock count */}
          {productCount !== undefined && productCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.65, type: "spring", stiffness: 260, damping: 20 }}
              className="absolute -bottom-4 left-2 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-lg sm:left-4"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-foreground">{productCount}</span> parts in stock
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
