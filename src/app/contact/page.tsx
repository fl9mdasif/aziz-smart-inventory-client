"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, Clock, MapPin } from "lucide-react";
import { PublicHeader, BUSINESS } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { ContactForm } from "@/components/public/ContactForm";
import { LocationMap } from "@/components/public/LocationMap";

const QUICK_INFO = [
  {
    icon: Phone,
    label: "Call us",
    value: BUSINESS.phone,
    href: `tel:${BUSINESS.phone}`,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us directly",
    href: `https://wa.me/${BUSINESS.whatsapp.replace("+", "")}`,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Clock,
    label: "Shop hours",
    value: "Sat–Thu, 9:00 AM – 8:00 PM",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 45% at 15% 10%, color-mix(in oklch, var(--primary), transparent 78%) 0%, transparent 65%), " +
              "radial-gradient(50% 45% at 90% 15%, color-mix(in oklch, oklch(0.6 0.1 195), transparent 82%) 0%, transparent 65%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Get in touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto mt-3 max-w-lg text-muted-foreground"
          >
            Questions about a part, a size, or stock availability? Call, message us on WhatsApp,
            or come find us at the shop.
          </motion.p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {QUICK_INFO.map((item, i) => {
            const content = (
              <>
                <div className={`mb-3 flex size-11 items-center justify-center rounded-full ${item.iconBg}`}>
                  <item.icon className={`size-5 ${item.iconColor}`} />
                </div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 font-medium">{item.value}</p>
              </>
            );

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="rounded-xl border bg-background p-5 shadow-sm">{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <ContactForm />
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MapPin className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Find us on the map</h2>
            </div>
            <LocationMap />
          </div>
        </div>
      </main>

      <PublicFooter />
      <FloatingWhatsApp />
    </div>
  );
}
