'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ExpandableAbstractProps {
  text: string;
  /** Character count above which the text gets a "Plus / More" toggle */
  limit?: number;
}

function findClipPoint(text: string, hardLimit: number): number {
  if (text.length <= hardLimit) return text.length;
  // Prefer to clip at a sentence boundary near the hard limit.
  const slice = text.slice(0, hardLimit);
  const sentence = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  if (sentence > hardLimit * 0.55) return sentence + 1;
  // Fall back to last word boundary.
  const word = slice.lastIndexOf(' ');
  return word > hardLimit * 0.4 ? word : hardLimit;
}

export function ExpandableAbstract({ text, limit = 220 }: ExpandableAbstractProps) {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > limit;
  const clipAt = isLong ? findClipPoint(text, limit) : text.length;
  const visible = isLong ? text.slice(0, clipAt).trimEnd() : text;
  const hidden = isLong ? text.slice(clipAt) : '';

  return (
    <p
      className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.18] text-[var(--color-text-primary)]"
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
    >
      {visible}
      {isLong && !expanded && (
        <>
          {'… '}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="ml-1 inline-flex items-baseline gap-1 align-baseline text-[14px] md:text-[15px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] transition-colors hover:text-white"
            style={{ fontFamily: 'var(--font-mono)' }}
            aria-expanded="false"
          >
            {t('more')}
            <span aria-hidden>→</span>
          </button>
        </>
      )}
      <AnimatePresence initial={false}>
        {isLong && expanded && (
          <motion.span
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline"
          >
            {hidden}
            {'  '}
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="ml-1 inline-flex items-baseline gap-1 align-baseline text-[14px] md:text-[15px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] transition-colors hover:text-white"
              style={{ fontFamily: 'var(--font-mono)' }}
              aria-expanded="true"
            >
              {t('less')}
              <span aria-hidden>←</span>
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </p>
  );
}
