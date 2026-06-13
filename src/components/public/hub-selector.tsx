'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { reveal, revealFadeOnly } from '@/lib/motion';

/**
 * HubSelector — the hero's destination picker. Three glass tiles, one per
 * pillar (Journal / Code / Contact), so a visitor chooses where to go without
 * scrolling. Internal anchors only: ↓ means "scrolls down this page",
 * ↗ stays reserved for external links. On mobile this doubles as the primary
 * nav (the header nav is hidden below md).
 */
interface HubSelectorProps {
  /** Reveal-cascade offset: tiles animate in after the hero's earlier beats. */
  revealOffset?: number;
}

export function HubSelector({ revealOffset = 3 }: HubSelectorProps) {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const variants = reduced ? revealFadeOnly : reveal;

  const destinations = [
    { href: '#journal', label: t('hubJournal') },
    { href: '#work', label: t('hubCode') },
    { href: '#contact', label: t('hubContact') },
  ];

  return (
    <nav aria-label={t('hubAria')}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {destinations.map((d, i) => (
          <div key={d.href} className="card-breathe" style={{ animationDelay: `${i * 0.9}s` }}>
            <motion.a
              href={d.href}
              variants={variants}
              custom={revealOffset + i * 0.5}
              className="glass-thin glass-hover group flex items-baseline justify-between gap-4 rounded-[var(--radius-glass)] px-4 py-3.5 transition-colors md:px-5"
            >
              <span
                className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {d.label}
              </span>
              <span
                aria-hidden
                className="text-[13px] text-[var(--color-text-tertiary)] transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-[var(--color-text-primary)]"
              >
                ↓
              </span>
            </motion.a>
          </div>
        ))}
      </div>
    </nav>
  );
}
