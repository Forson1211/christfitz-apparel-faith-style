import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/site/StaticPage";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/_site/faqs")({
  component: FaqsPage,
});

const FAQS = [
  {
    q: "What does ChristFitz mean?",
    a: "ChristFitz is a movement centered on 'Fitting into Christ'. Our apparel is designed for the modern believer who wants to wear their faith boldly and with conviction."
  },
  {
    q: "Where is ChristFitz based?",
    a: "We are proudly based in Accra, Ghana, drawing inspiration from our vibrant local culture and global spiritual heritage."
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to believers all over the world. International shipping usually takes 7-14 business days depending on your location."
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you will receive an email with a tracking number. You can also view your order status in your Account dashboard."
  },
  {
    q: "What is your return policy?",
    a: "We accept returns for unworn items in original packaging within 14 days of delivery. We offer exchanges or store credit."
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled within 12 hours of being placed. After that, we may have already started processing your pieces."
  },
  {
    q: "How do I care for my ChristFitz pieces?",
    a: "To preserve the quality of our premium fabrics, we recommend washing in cold water and air-drying. Always iron inside-out."
  }
];

function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <StaticPage title="FAQs" eyebrow="Support">
      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div 
            key={i} 
            className="rounded-3xl border border-cocoa/10 bg-white/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-6 text-left transition hover:bg-cocoa/5"
            >
              <span className="font-display text-xl text-cocoa">{faq.q}</span>
              {openIndex === i ? (
                <Minus className="h-5 w-5 text-gold" />
              ) : (
                <Plus className="h-5 w-5 text-gold" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 rounded-[3rem] bg-cocoa text-cream text-center">
        <h3 className="font-display text-3xl mb-4">Still have questions?</h3>
        <p className="text-cream/60 mb-8 max-w-sm mx-auto">
          Our team is ready to assist you on your journey.
        </p>
        <a 
          href="/contact" 
          className="inline-block rounded-full bg-gold px-8 py-4 text-sm font-medium text-cocoa transition hover:scale-105"
        >
          Contact Support
        </a>
      </div>
    </StaticPage>
  );
}
