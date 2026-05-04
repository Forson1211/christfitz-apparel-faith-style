import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
}

export function StaticPage({ title, eyebrow, children }: StaticPageProps) {
  return (
    <div className="pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee">— {eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl">{title}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-stone max-w-none text-muted-foreground leading-loose"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
