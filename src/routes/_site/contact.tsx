import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ChristFitz Apparel" },
      { name: "description", content: "Get in touch with the ChristFitz team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent. We'll be in touch.");
    }, 800);
  };

  return (
    <section className="relative pt-36 pb-28 sm:pt-40 sm:pb-36">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— Get in touch</p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl">Say hello.</h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Questions, collaborations, or just want to share your story? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            {[
              { Icon: Mail, label: "Email", value: "hello@christfitz.com" },
              { Icon: Phone, label: "Phone", value: "+1 (555) 010-2024" },
              { Icon: MapPin, label: "Studio", value: "Brooklyn, NY" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl glass p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cocoa text-cream">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-3xl glass p-6 sm:p-8 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                placeholder="Your name"
                className="w-full rounded-full border border-cocoa/15 bg-cream/60 px-5 py-3 outline-none focus:border-coffee"
              />
              <input
                required
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full rounded-full border border-cocoa/15 bg-cream/60 px-5 py-3 outline-none focus:border-coffee"
              />
            </div>
            <input
              name="subject"
              placeholder="Subject"
              className="w-full rounded-full border border-cocoa/15 bg-cream/60 px-5 py-3 outline-none focus:border-coffee"
            />
            <textarea
              required
              name="message"
              placeholder="Tell us what's on your mind…"
              rows={6}
              className="w-full rounded-3xl border border-cocoa/15 bg-cream/60 px-5 py-4 outline-none focus:border-coffee"
            />
            <button
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-cocoa px-7 py-3.5 text-sm font-medium text-cream transition hover:bg-coffee disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
