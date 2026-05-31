'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Project } from '@prisma/client';
import { WorkCard } from '@/components/public/work-card';
import { SectionTitle } from '@/components/public/section-title';
import { reveal } from '@/lib/motion';
import { cn } from '@/lib/cn';

interface WorkSectionProps {
  projects: Project[];
  locale: 'en' | 'fr';
}

/**
 * Bento layout — every cell is a true square.
 *
 *  Grid:   1 col (mobile)  ·  2 cols (md)  ·  4 cols (lg)
 *  Cell:   `aspect-square` enforces 1:1 ratio on every card
 *  Featured: occupies 2×2 cells on lg (= one big square the size of 4 normal ones)
 *
 *  Because every card claims `aspect-square`, the grid rows derive their
 *  height from the column width. row-span-2 + col-span-2 stays square because
 *  2 cols of width + 1 gap = 2 cards stacked vertically (incl. their gap).
 *
 *  The layout flows naturally for any N — add a 6th, 7th, 10th project and
 *  they fill row 3, 4, etc. with the same square footprint.
 */
export function WorkSection({ projects, locale }: WorkSectionProps) {
  const t = useTranslations('work');
  // Stable, predictable order: featured first, then everything else.
  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  return (
    <section
      id="work"
      className="relative mx-auto max-w-[1280px] px-6 py-[80px] md:px-12 md:py-[96px] lg:px-20"
      aria-label="Work"
    >
      <div className="mb-12 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <SectionTitle>{t('title')}</SectionTitle>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {t('count', { n: projects.length })}
        </motion.span>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4"
      >
        {ordered.map((p, i) => (
          <motion.div
            key={p.id}
            variants={reveal}
            custom={i}
            className={cn(
              'aspect-square',
              p.featured && 'lg:col-span-2 lg:row-span-2'
            )}
          >
            <WorkCard project={p} locale={locale} featured={p.featured} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
