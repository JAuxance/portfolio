'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';

/**
 * SectionCta — the single shared grammar for a section-end call to action:
 * a mono uppercase hint on the left, one outbound action on the right.
 *
 * Two registers:
 *   · 'text'  — quiet mono link with ↗ (the site-wide egress glyph)
 *   · 'solid' — inverted pill; reserved for the page's visual apex
 *               (the Journal subscribe CTA). Use sparingly.
 */
interface SectionCtaProps {
  hint?: string;
  label: string;
  href: string;
  variant?: 'solid' | 'text';
  className?: string;
}

export function SectionCta({ hint, label, href, variant = 'text', className }: SectionCtaProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={cn(
        'mt-12 flex flex-wrap items-center gap-x-8 gap-y-5',
        hint ? 'justify-between' : 'justify-end',
        className
      )}
    >
      {hint && (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {hint}
        </p>
      )}
      {variant === 'solid' ? (
        <CtaPill href={href} label={label} />
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label} ↗
        </a>
      )}
    </motion.div>
  );
}

/**
 * The pill CTA, also used standalone (journal empty-state card, project
 * detail actions). 'solid' = inverted apex pill; 'glass' = bordered glass.
 */
export function CtaPill({
  href,
  label,
  variant = 'solid',
}: {
  href: string;
  label: string;
  variant?: 'solid' | 'glass';
}) {
  const reduced = useReducedMotion();
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={
        reduced
          ? undefined
          : {
              scale: 1.04,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.18), 0 0 16px rgba(255,255,255,0.08)',
            }
      }
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: duration.quick, ease: ease.spring }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[12px] font-medium select-none',
        variant === 'solid'
          ? 'border-[var(--color-glass-border-hover)] bg-[var(--color-text-primary)] text-[var(--color-bg)]'
          : 'glass glass-hover border-[var(--color-glass-border-hover)] text-[var(--color-text-primary)] transition-colors'
      )}
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', borderRadius: 999 }}
    >
      {label}
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M4 10L10 4M10 4H5M10 4V9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.a>
  );
}
