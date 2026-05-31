'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { ResearchTopic, Reference } from '@prisma/client';
import { SectionTitle } from '@/components/public/section-title';
import { reveal } from '@/lib/motion';

interface ResearchSectionProps {
  topics: ResearchTopic[];
  references: Reference[];
  locale: 'en' | 'fr';
}

export function ResearchSection({ topics, references, locale }: ResearchSectionProps) {
  const t = useTranslations('research');

  return (
    <section
      id="research"
      className="relative mx-auto max-w-[880px] px-6 py-[80px] md:py-[96px]"
      aria-label="Research"
    >
      <SectionTitle className="mb-14">{t('title')}</SectionTitle>

      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="flex flex-col gap-12 md:gap-16"
      >
        {topics.map((topic, i) => {
          const title = locale === 'fr' ? topic.titleFr : topic.titleEn;
          const body = locale === 'fr' ? topic.bodyFr : topic.bodyEn;

          return (
            <motion.li key={topic.id} variants={reveal} custom={i} className="flex flex-col gap-3">
              <span
                className="font-mono text-[14px] font-medium tracking-[0.06em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {topic.number}
              </span>
              <h3
                className="text-[22px] md:text-[26px] font-semibold leading-[1.18] text-[var(--color-text-primary)]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.015em' }}
              >
                {title}
              </h3>
              <p className="max-w-[700px] text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
                {body}
              </p>
            </motion.li>
          );
        })}
      </motion.ol>

      {references.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 border-t border-[var(--color-glass-border)] pt-10"
        >
          <p
            className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {t('refs')}
          </p>
          <ul className="flex flex-col gap-2">
            {references.map((ref) => (
              <li key={ref.id} className="text-[12px] leading-[1.7] text-[var(--color-text-secondary)]">
                {ref.citation}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  );
}
