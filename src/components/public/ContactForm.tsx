"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { BUSINESS } from "./PublicHeader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// There's no backend endpoint to receive a contact-form submission (no
// email/messaging service is wired up server-side) — so "submitting" opens
// a pre-filled WhatsApp chat instead of silently posting nowhere. The CTA
// label says exactly that, so it's never misleading about what happens.
export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      toast.error("Please add your name and a message first.");
      return;
    }

    const lines = [
      `Hi ${BUSINESS.name}, I'm ${name.trim()}.`,
      phone.trim() ? `My phone: ${phone.trim()}` : null,
      "",
      message.trim(),
    ].filter((line) => line !== null);

    const url = `https://wa.me/${BUSINESS.whatsapp.replace("+", "")}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp with your message ready to send.");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border bg-background p-5 shadow-sm sm:p-6"
    >
      <div>
        <h3 className="font-semibold">Send us a message</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill this in and it opens WhatsApp with your message ready to send — we don&apos;t sell
          online, so a real reply comes from a real person on chat.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Your name</Label>
        <Input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Karim Hossain"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us which part or size you're looking for..."
          className="min-h-28"
          required
        />
      </div>

      <Button type="submit" className="w-full gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
        <MessageCircle className="size-4" />
        Send via WhatsApp
      </Button>
    </motion.form>
  );
}
