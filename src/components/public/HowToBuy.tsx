"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, Store } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

const steps = [
  {
    icon: Store,
    title: "Visit the shop",
    description: "Come see the product in person and pick up what you need.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Phone,
    title: "Call ahead",
    description: `Call ${BUSINESS.phone} to confirm stock before you travel.`,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    icon: MessageCircle,
    title: "Message on WhatsApp",
    description: "Send us a message to ask about pricing or availability.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
];

export function HowToBuy() {
  return (
    <section id="how-to-buy" className="relative mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight">How to buy</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Available now — visit us to purchase. We don&apos;t sell online, every order is
          completed in person or over the phone.
        </p>
      </motion.div>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="rounded-xl border bg-background p-5 text-center shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-full ${step.iconBg}`}>
              <step.icon className={`size-5 ${step.iconColor}`} />
            </div>
            <h3 className="font-medium">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
