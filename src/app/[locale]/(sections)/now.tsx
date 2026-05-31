'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { NowItem } from '@prisma/client';
import { NowCard } from '@/components/public/now-card';
import { SectionTitle } from '@/components/public/section-title';
import { reveal } from '@/lib/motion';

interface NowSectionProps {
  items: NowItem[];
  locale: 'en' | 'fr';
  updatedMonth: string;
  updatedYear: string;
}

export function NowSection({ items, locale, updatedMonth, updatedYear }: NowSectionProps) {
  const t = useTranslations('now');

  return (
    <section
      id="now"
      className="relative mx-auto max-w-[1280px] px-6 py-[80px] md:px-12 md:py-[96px] lg:px-20"
      aria-label="Now"
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
          {t('updated', { month: updatedMonth, year: updatedYear })}
        </motion.span>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            variants={reveal}
            custom={i}
            className={i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
          >
            <NowCard item={item} locale={locale} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
