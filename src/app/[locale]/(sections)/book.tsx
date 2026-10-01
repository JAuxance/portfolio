'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScrollText } from '@/components/public/scroll-text';
import { SectionTitle } from '@/components/public/section-title';

interface BookSectionProps {
  book: {
    title: string;
    subtitle: string | null;
    description: string | null;
    targetWords: number;
    totalWords: number;
    publishedChapters: number;
    paused: boolean;
  };
  locale: 'en' | 'fr';
}

export function BookSection({ book, locale }: BookSectionProps) {
  const t = useTranslations('book');
  const progress =
    book.targetWords > 0
      ? Math.min(100, Math.round((book.totalWords / book.targetWords) * 100))
      : 0;

  return (
    <section
      id="book"
      className="relative mx-auto max-w-[960px] px-6 py-[80px] md:px-10 md:py-[96px]"
      aria-label={t('sectionTitle')}
    >
      <SectionTitle className="mb-12">{t('sectionTitle')}</SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={`/${locale}/book`}
          className="book-reading-paper group block overflow-hidden rounded-[4px] transition-transform duration-500 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between border-b border-[#e7e3da] px-6 py-4 md:px-10">
            <span className="text-[11px] font-semibold text-[#4f4b45]">
              Auxance Jourdan
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#8a857d]">
              {book.paused ? t('pausedEyebrow') : t('eyebrow')}
            </span>
          </div>

          <div className="px-6 py-12 text-center md:px-12 md:py-16">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857d]">
              {t('publication')}
            </p>
            <h3 className="mx-auto mt-5 max-w-[700px] font-[var(--font-book)] text-[42px] font-bold leading-[0.98] tracking-[-0.045em] text-[#22211f] md:text-[62px]">
              {book.title}
            </h3>
            {book.subtitle && (
              <p className="mx-auto mt-5 max-w-[580px] font-[var(--font-book)] text-[19px] italic leading-[1.45] text-[#625e57] md:text-[22px]">
                {book.subtitle}
              </p>
            )}
            {book.description && (
              <ScrollText className="mx-auto mt-6 max-w-[600px] text-[13px] leading-[1.75] text-[#777169]">
                {book.description}
              </ScrollText>
            )}
          </div>

          <div className="border-t border-[#e7e3da] px-6 py-5 md:px-10">
            <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-[0.13em] text-[#8a857d]">
              <span>
                {book.publishedChapters} {t('chapters')} ·{' '}
                {book.totalWords.toLocaleString(
                  locale === 'fr' ? 'fr-FR' : 'en-US'
                )}{' '}
                {t('words')}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-px bg-[#ded9d0]">
              <div
                className="h-px bg-[#282622] transition-[width] duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-5 flex justify-end">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#4f4b45] transition-transform group-hover:translate-x-1">
                {t('read')}
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
