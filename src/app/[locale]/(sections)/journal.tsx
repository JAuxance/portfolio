'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { SectionTitle } from '@/components/public/section-title';
import { SectionCta, CtaPill } from '@/components/public/section-cta';
import { reveal } from '@/lib/motion';
import {
  substackHomeUrl,
  substackSubscribeUrl,
  substackConfigured,
  type JournalPost,
} from '@/lib/substack';

interface JournalSectionProps {
  posts: JournalPost[];
  locale: 'en' | 'fr';
}

/**
 * Journal — an editorial index of Substack entries, not a card grid.
 * Rows echo the research section's typographic rhythm: hairline rules,
 * a mono date column, and an arrow that only surfaces on hover.
 *
 * Every Substack-bound link is gated on `substackConfigured` so the
 * pre-launch site never renders a dead URL.
 */
export function JournalSection({ posts, locale }: JournalSectionProps) {
  const t = useTranslations('journal');
  const fmt = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section
      id="journal"
      className="relative mx-auto max-w-[880px] px-6 py-[80px] md:py-[96px]"
      aria-label="Journal"
    >
      <div className="mb-12 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <SectionTitle>{t('title')}</SectionTitle>
        {/* The corner link only exists once the real Substack is live —
            pre-launch it would be dead gray text. */}
        {substackConfigured && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href={substackHomeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {t('via')} ↗
            </a>
          </motion.span>
        )}
      </div>

      {posts.length > 0 ? (
        <>
          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10%' }}
            className="flex flex-col"
          >
            {posts.map((post, i) => (
              <motion.li
                key={post.link}
                variants={reveal}
                custom={i}
                className="group border-t border-[var(--color-glass-border)] last:border-b"
              >
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid items-baseline gap-x-8 gap-y-1.5 py-6 md:grid-cols-[120px_1fr_auto] md:py-7"
                >
                  <time
                    dateTime={post.publishedAt}
                    className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {fmt.format(new Date(post.publishedAt))}
                  </time>
                  <div className="flex flex-col gap-2">
                    <h3
                      className="text-[17px] md:text-[19px] font-semibold leading-[1.3] text-[var(--color-text-primary)] transition-opacity group-hover:opacity-80"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.015em' }}
                    >
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="max-w-[560px] text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className="hidden text-[14px] text-[var(--color-text-tertiary)] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--color-text-primary)] group-hover:opacity-100 md:block"
                  >
                    ↗
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ol>

          <SectionCta label={t('subscribe')} href={substackSubscribeUrl} variant="solid" />
        </>
      ) : (
        <div className="card-breathe">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass flex flex-col items-start gap-5 p-7 md:p-9"
          >
            <span
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)] opacity-70 shadow-[0_0_8px_currentColor]"
              />
              {t('emptyLabel')}
            </span>
            <p className="max-w-[560px] text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
              {t('empty')}
            </p>
            {substackConfigured && <CtaPill href={substackSubscribeUrl} label={t('subscribe')} />}
          </motion.div>
        </div>
      )}
    </section>
  );
}
