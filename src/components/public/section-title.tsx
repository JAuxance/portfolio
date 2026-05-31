'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/cn';

interface SectionTitleProps {
  /** The visible title text, e.g. "Selected work." */
  children: string;
  /** Optional mono prefix shown on its own line above the title, e.g. "§ 02 · Work" */
  eyebrow?: string;
  /** Pull className through for spacing tweaks per section. */
  className?: string;
  /** "left" (default) | "center" — affects the eyebrow + caret position. */
  align?: 'left' | 'center';
  /** Visual size — display | display-sm. */
  size?: 'display' | 'display-sm';
  /** Render as h1 instead of h2 (e.g. for project detail pages). */
  as?: 'h1' | 'h2';
}

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      delay: i * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

/**
 * SectionTitle — the project's signature heading style.
 *
 *   ▮ identity decisions:
 *     · typeface: JetBrains Mono, weight 600 (semibold)
 *     · case:     sentence case with a final period (cohérent avec "Selected work.")
 *     · entrance: per-word stagger with a 6px → 0 blur reveal
 *     · accent:   a thin caret that blinks for ~3s on first view, then fades
 *     · eyebrow:  a mono "§ 02 · label" anchored above (optional)
 *     · underline pulse on hover keyed to a subtle horizontal gradient sweep
 */
export function SectionTitle({
  children,
  eyebrow,
  className,
  align = 'left',
  size = 'display',
  as = 'h2',
}: SectionTitleProps) {
  const reduced = useReducedMotion();
  const words = useMemo(() => children.split(' '), [children]);

  const sizing =
    size === 'display'
      ? 'text-[32px] sm:text-[40px] md:text-[48px] lg:text-[52px]'
      : 'text-[24px] sm:text-[28px] md:text-[32px]';

  const Component = as === 'h1' ? motion.h1 : motion.h2;

  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <motion.span
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'mb-3 inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]',
            align === 'center' ? 'justify-center w-full' : ''
          )}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span aria-hidden className="h-px w-5 bg-[var(--color-text-tertiary)]/40" />
          {eyebrow}
        </motion.span>
      )}

      <Component
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20%' }}
        className={cn(
          'section-title relative inline-flex flex-wrap items-baseline gap-x-[0.28em] gap-y-1 font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--color-text-primary)]',
          sizing
        )}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            custom={i}
            variants={reduced ? undefined : wordReveal}
            initial={reduced ? { opacity: 0 } : undefined}
            animate={reduced ? { opacity: 1 } : undefined}
            transition={reduced ? { duration: 0.4, delay: i * 0.02 } : undefined}
            className="inline-block"
          >
            {w}
          </motion.span>
        ))}
        <Caret reduced={!!reduced} />
      </Component>
    </div>
  );
}

function Caret({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scaleY: 0.4 }}
      whileInView={{ opacity: [0, 1, 1, 0], scaleY: [0.4, 1, 1, 1] }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{
        duration: 3.6,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.08, 0.85, 1],
      }}
      className="ml-[0.08em] inline-block h-[0.78em] w-[0.08em] translate-y-[0.04em] bg-[var(--color-text-primary)]"
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <motion.span
        className="block h-full w-full bg-[var(--color-text-primary)]"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1.0, repeat: 3, ease: 'easeInOut' }}
      />
    </motion.span>
  );
}
