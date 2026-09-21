"use client";

import { motion } from "framer-motion";
import { Ship, PackageCheck, Wallet, Users } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

const points = [
  {
    icon: Ship,
    title: "Direct from China",
    description: "We import regularly, straight from trusted factories — not a reseller's leftovers.",
  },
  {
    icon: PackageCheck,
    title: "Genuine parts, in stock",
    description: "What you see is what's on the shelf — no waiting weeks for a part to arrive.",
  },
  {
    icon: Wallet,
    title: "Fair, local pricing",
    description: "Bulk-imported and sold locally, so you skip the markup of a middleman.",
  },
  {
    icon: Users,
    title: "Built for the trade",
    description: "Stocked for tailors, garment units, and repair shops who need the right part today.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Why buy from {BUSINESS.name}?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          We import sewing-machine parts and accessories from China on a regular cycle and stock
          them locally — that&apos;s the whole idea.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point, i) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10">
              <point.icon className="size-5 text-primary" />
            </div>
            <h3 className="font-medium">{point.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{point.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
