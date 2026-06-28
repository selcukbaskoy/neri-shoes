"use client";

import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Props = {
  title: string;
  message: string;
  backHome: string;
  viewProducts: string;
};

export default function NotFoundContent({ title, message, backHome, viewProducts }: Props) {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0.01 : 0.65,
      delay: shouldReduceMotion ? 0 : delay,
      ease: EASE_OUT,
    },
  });

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-black px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(255,208,0,0.06),transparent_70%)]" />
      <div className="hero-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          {...fadeUp(0)}
          className="font-serif text-[8rem] font-bold leading-none tracking-tight text-accent md:text-[12rem]"
        >
          404
        </motion.p>

        <motion.div
          initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.8,
            delay: shouldReduceMotion ? 0 : 0.3,
            ease: EASE_OUT,
          }}
          style={{ originX: 0.5 }}
          className="my-6 h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
        />

        <motion.h1
          {...fadeUp(0.45)}
          className="mb-4 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl"
        >
          {title}
        </motion.h1>

        <motion.p
          {...fadeUp(0.6)}
          className="mb-10 max-w-sm text-sm leading-relaxed text-muted md:text-base"
        >
          {message}
        </motion.p>

        <motion.div
          {...fadeUp(0.75)}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/" className="btn-primary">
            {backHome}
          </Link>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center gap-2 rounded border-2 border-accent/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-accent/70 transition-all duration-200 hover:border-accent hover:text-accent"
          >
            {viewProducts}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
