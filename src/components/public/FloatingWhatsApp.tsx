"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={`https://wa.me/${BUSINESS.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
    >
      <MessageCircle className="size-6" />
    </motion.a>
  );
}
