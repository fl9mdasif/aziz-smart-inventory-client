"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PackageSearch, Home, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/public/LogoMark";
import { BUSINESS } from "@/components/public/PublicHeader";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* Same two-tone mesh gradient as the homepage hero, for brand continuity. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, color-mix(in oklch, var(--primary), transparent 72%) 0%, transparent 65%), " +
            "radial-gradient(50% 45% at 90% 15%, color-mix(in oklch, oklch(0.6 0.1 195), transparent 78%) 0%, transparent 65%), " +
            "radial-gradient(60% 40% at 50% 100%, color-mix(in oklch, var(--primary), transparent 85%) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-semibold">{BUSINESS.name}</span>
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.05, type: "spring", stiffness: 200, damping: 18 }}
        className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl"
      >
        404
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
        className="mt-2 flex size-14 items-center justify-center rounded-full bg-primary/10"
      >
        <PackageSearch className="size-6 text-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-5"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          This page doesn&apos;t exist or may have moved. It happens — even in a well-stocked
          shop, things shift shelves sometimes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Button render={<Link href="/" />} className="gap-2 rounded-full px-5">
          <Home className="size-4" />
          Back to home
        </Button>
        <Button
          render={<Link href="/contact" />}
          variant="outline"
          className="gap-2 rounded-full px-5"
        >
          <MessageCircle className="size-4" />
          Contact us
        </Button>
      </motion.div>
    </div>
  );
}
