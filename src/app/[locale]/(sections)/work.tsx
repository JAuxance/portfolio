'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project } from '@prisma/client';
import { SectionTitle } from '@/components/public/section-title';
import { SectionCta } from '@/components/public/section-cta';
import { StatusPill } from '@/components/public/status-pill';
import { reveal } from '@/lib/motion';

interface WorkSectionProps {
  projects: Project[];
  locale: 'en' | 'fr';
  githubUrl: string | null;
}

/**
 * Work as a file index: numbered hairline rows on the left, and a sticky
 * spec card on the right that crossfades to the hovered project's details. Rows use the same compact typographic grammar as the rest of the site;
 * on mobile the card disappears and each row carries its tagline inline.
 */
export function WorkSection({ projects, locale, githubUrl }: WorkSectionProps) {
  const t = useTranslations('work');
  // The admin `order` field is the single source of truth for row order.
  const ordered = projects;
  const [active, setActive] = useState(0);
  const current = ordered[active] ?? ordered[0];

  return (
    <section
      id="work"
      className="relative mx-auto max-w-[1280px] px-6 py-[80px] md:px-12 md:py-[96px] lg:px-20"
      aria-label="Work"
    >
      <SectionTitle className="mb-12">{t('title')}</SectionTitle>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
        {/* Index rows */}
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="flex h-fit flex-col gap-3 md:gap-4"
        >
          {ordered.map((p, i) => {
            const name = locale === 'fr' ? p.nameFr : p.nameEn;
            const tagline = locale === 'fr' ? p.taglineFr : p.taglineEn;
            return (
              <motion.li key={p.id} variants={reveal} custom={i} className="group">
                <div className="card-breathe">
                <Link
                  href={`/${locale}/work/${p.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="glass glass-hover flex flex-col gap-4 px-5 py-5 transition-colors md:px-6 md:py-6"
                >
                  <span className="flex items-baseline gap-4 md:gap-6">
                    <span
                      className="font-mono text-[12px] tracking-[0.08em] text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="inline-block flex-1 text-[26px] font-semibold leading-[1.05] text-[var(--color-text-primary)] transition-transform duration-300 group-hover:translate-x-1.5 md:text-[32px]"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
                    >
                      {name}
                    </span>
                    <StatusPill status={p.status} locale={locale} />
                    <span
                      aria-hidden
                      className="hidden text-[16px] text-[var(--color-text-tertiary)] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-text-primary)] group-hover:opacity-100 md:block"
                    >
                      →
                    </span>
                  </span>

                  {/* Tagline reads inline below md and inside the panel on lg */}
                  <p className="max-w-[560px] pl-[30px] text-[13px] leading-[1.6] text-[var(--color-text-secondary)] md:pl-[38px] lg:hidden">
                    {tagline}
                  </p>

                </Link>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>

        {/* Sticky preview panel (desktop) */}
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="card-breathe sticky top-24">
              <div className="glass relative min-h-[380px] overflow-hidden p-7" style={{ borderRadius: 20 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-full min-h-[324px] flex-col"
                  >
                    <div
                      className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <span>
                        {String(active + 1).padStart(2, '0')} / {String(ordered.length).padStart(2, '0')}
                      </span>
                      <StatusPill status={current.status} locale={locale} />
                    </div>

                    <h3
                      className="mt-8 text-[34px] font-semibold leading-[1.02] text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}
                    >
                      {locale === 'fr' ? current.nameFr : current.nameEn}
                    </h3>
                    <p className="mt-4 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                      {locale === 'fr' ? current.taglineFr : current.taglineEn}
                    </p>

                    {current.stack.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-1.5">
                        {current.stack.slice(0, 6).map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-[var(--color-glass-border-hover)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href={`/${locale}/work/${current.slug}`}
                      className="mt-auto inline-flex items-center gap-2 pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-primary)]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {t('viewProject')} <span aria-hidden>→</span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {githubUrl && <SectionCta label={t('allCode')} href={githubUrl} variant="text" />}
    </section>
  );
}
