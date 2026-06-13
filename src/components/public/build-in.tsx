'use client';

import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BuildInProps {
  children: ReactNode;
  /** Cascade position — each step adds ~90ms of delay. */
  index?: number;
  /** Animate when scrolled into view instead of on mount (below-fold sections). */
  inView?: boolean;
  className?: string;
}

/**
 * BuildIn — the project-page "construction" beat: blocks fade up out of a
 * slight blur, one after the other. Key it by slug (`key={`${slug}-hero`}`)
 * so swapping between projects (Prev/Next) replays the build.
 */
export function BuildIn({ children, index = 0, inView = false, className }: BuildInProps) {
  const reduced = useReducedMotion();
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: 'blur(4px)' };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' };
  const transition = { duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] as const };

  if (inView) {
    return (
      <motion.div
        initial={hidden}
        whileInView={shown}
        viewport={{ once: true, margin: '-10%' }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div initial={hidden} animate={shown} transition={transition} className={className}>
      {children}
    </motion.div>
  );
}
