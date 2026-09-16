import { Phone, MessageCircle, Store } from "lucide-react";
import { BUSINESS } from "./PublicHeader";

const steps = [
  {
    icon: Store,
    title: "Visit the shop",
    description: "Come see the product in person and pick up what you need.",
  },
  {
    icon: Phone,
    title: "Call ahead",
    description: `Call ${BUSINESS.phone} to confirm stock before you travel.`,
  },
  {
    icon: MessageCircle,
    title: "Message on WhatsApp",
    description: "Send us a message to ask about pricing or availability.",
  },
];

export function HowToBuy() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="mb-1 text-lg font-semibold">How to buy</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Available now — visit us to purchase. We don&apos;t sell online, every order is
        completed in person or over the phone.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-lg border p-4">
            <step.icon className="mb-2 size-5 text-muted-foreground" />
            <h3 className="font-medium">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
