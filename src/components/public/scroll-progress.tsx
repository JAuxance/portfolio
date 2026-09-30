'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

/** Thin reading-progress bar; sits on the bottom edge of the fixed header. */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 -bottom-px h-px origin-left bg-[var(--color-text-primary)]/60"
      style={{ scaleX }}
    />
  );
}
